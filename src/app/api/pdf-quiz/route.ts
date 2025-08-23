import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { getAuthSession } from "@/lib/nextauth";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs/promises";
import { Document } from "langchain/document";
import { NextResponse } from "next/server";
import os from "os";
import path from "path";

export async function POST(req: Request) {
  const tempDir = path.join(os.tmpdir(), 'pdf-uploads');
  let tempFilePath: string | null = null;

  try {
    // Verify database connection first
    try {
      await prisma.$connect();
      console.log("Database connection successful");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { error: "Failed to connect to database" },
        { status: 500 }
      );
    }

    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a quiz." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;
    const amount = parseInt(formData.get('amount') as string);
    const type = formData.get('type') as string;
    const level = formData.get('level') as string;

    if (!pdfFile || !amount || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate level
    const validLevels = ["beginner", "intermediate", "expert"];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: `Invalid level: ${level}` },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }

    // Generate a unique filename for temporary storage
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const sanitizedFilename = pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}-${randomString}-${sanitizedFilename}`;
    tempFilePath = path.join(tempDir, filename);

    // Convert File to Buffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    
    // Save to temporary file for PDFLoader
    await fs.writeFile(tempFilePath, new Uint8Array(arrayBuffer));
    console.log("PDF saved to temp file:", tempFilePath);

    // Load and process the PDF
    let pdfText;
    try {
      const loader = new PDFLoader(tempFilePath);
      const docs = await loader.load();
      pdfText = docs.map((doc: Document) => doc.pageContent).join(' ');
      console.log("PDF processed successfully");
    } catch (pdfError) {
      console.error("PDF processing error:", pdfError);
      return NextResponse.json(
        { error: "Failed to process PDF file" },
        { status: 400 }
      );
    }

    // Create game in database with PDF data
    console.log("Creating game with data:", {
      gameType: type,
      userId: session.user.id,
      topic: pdfFile.name.replace('.pdf', ''),
      level,
    });

    const game = await prisma.game.create({
      data: {
        gameType: type as "mcq" | "open_ended",
        timeStarted: new Date(),
        userId: session.user.id,
        topic: pdfFile.name.replace('.pdf', ''),
        level,
        pdfName: pdfFile.name,
        pdfData: pdfBuffer.toString('base64'), // Store PDF as base64 in database
      },
    });

    console.log("Game created:", game.id);

    // Generate questions
    let questions;
    try {
      if (type === "mcq") {
        questions = await strict_output(
          `You are a helpful AI that is able to generate multiple choice questions and answers based on provided text content. The questions should be clear, concise, and directly related to the content. You MUST generate exactly ${amount} questions, no more and no less.`,
          new Array(amount).fill(
            `Generate a random ${level} multiple choice question about this text: ${pdfText}. The question must be unique and different from other questions.`
          ),
          {
            question: "question",
            answer: "answer with max length of 15 words",
            option1: "option1 with max length of 15 words",
            option2: "option2 with max length of 15 words",
            option3: "option3 with max length of 15 words",
          }
        );
      } else {
        questions = await strict_output(
          `You are a helpful AI that is able to generate open-ended questions and answers based on provided text content. The questions should encourage critical thinking and understanding. You MUST generate exactly ${amount} questions, no more and no less.`,
          new Array(amount).fill(
            `Generate a random ${level} open-ended question about this text: ${pdfText}. The question must be unique and different from other questions.`
          ),
          {
            question: "question",
            answer: "answer with max length of 15 words",
          }
        );
      }

      console.log("Questions generated successfully");
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      // Clean up the game
      await prisma.game.delete({ where: { id: game.id } }).catch(console.error);
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 }
      );
    }

    // Ensure we have exactly the requested number of questions
    if (!questions || questions.length !== amount) {
      // Clean up the game
      await prisma.game.delete({ where: { id: game.id } }).catch(console.error);
      return NextResponse.json(
        { error: `Failed to generate exactly ${amount} questions from the PDF. Please try again.` },
        { status: 400 }
      );
    }

    try {
      // Create questions in database
      if (type === "mcq") {
        const manyData = questions.map((question: any) => {
          const options = [
            question.option1,
            question.option2,
            question.option3,
            question.answer,
          ].sort(() => Math.random() - 0.5);
          return {
            question: question.question,
            answer: question.answer,
            options: JSON.stringify(options),
            gameId: game.id,
            questionType: "mcq",
          };
        });

        await prisma.question.createMany({
          data: manyData,
        });
      } else {
        await prisma.question.createMany({
          data: questions.map((question: any) => {
            return {
              question: question.question,
              answer: question.answer,
              gameId: game.id,
              questionType: "open_ended",
            };
          }),
        });
      }

      // Update topic count
      // await prisma.topic_count.upsert({
      //   where: {
      //     topic: pdfFile.name.replace('.pdf', ''),
      //   },
      //   create: {
      //     topic: pdfFile.name.replace('.pdf', ''),
      //     count: 1,
      //   },
      //   update: {
      //     count: {
      //       increment: 1,
      //     },
      //   },
      // });

      console.log("Questions saved to database successfully");
    } catch (dbError) {
      console.error("Database error while saving questions:", dbError);
      // Clean up the game
      await prisma.game.delete({ where: { id: game.id } }).catch(console.error);
      return NextResponse.json(
        { error: "Failed to save questions to database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ gameId: game.id }, { status: 200 });
  } catch (error) {
    console.error("Error processing PDF quiz:", error);
    return NextResponse.json(
      { error: "Failed to process PDF and create quiz" },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (tempFilePath) {
      await fs.unlink(tempFilePath).catch(console.error);
    }
    await prisma.$disconnect();
  }
}