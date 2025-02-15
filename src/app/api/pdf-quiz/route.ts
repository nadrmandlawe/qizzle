import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { getAuthSession } from "@/lib/nextauth";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs/promises";
import { Document } from "langchain/document";
import { NextResponse } from "next/server";
import path from "path";

export async function POST(req: Request) {
  try {
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${pdfFile.name}`;
    const filePath = path.join(uploadsDir, filename);
    const pdfUrl = `/uploads/${filename}`;

    // Convert File to Buffer and save to filesystem
    const arrayBuffer = await pdfFile.arrayBuffer();
    await fs.writeFile(filePath, new Uint8Array(arrayBuffer));

    // Load and process the PDF
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    // Extract and process the text
    const pdfText = docs.map((doc: Document) => doc.pageContent).join(' ');

    let questions;
    if (type === "mcq") {
      questions = await strict_output(
        `You are a helpful AI that is able to generate multiple choice questions and answers based on provided text content. The questions should be clear, concise, and directly related to the content. You MUST generate exactly ${amount} questions.`,
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
        `You are a helpful AI that is able to generate open-ended questions and answers based on provided text content. The questions should encourage critical thinking and understanding. You MUST generate exactly ${amount} questions.`,
        new Array(amount).fill(
          `Generate a random ${level} open-ended question about this text: ${pdfText}. The question must be unique and different from other questions.`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
        }
      );
    }

    // Ensure we have the correct number of questions
    if (questions.length !== amount) {
      return NextResponse.json(
        { error: "Failed to generate the requested number of questions" },
        { status: 500 }
      );
    }

    // Create game in database with PDF information
    const game = await prisma.game.create({
      data: {
        userId: session.user.id,
        timeStarted: new Date(),
        topic: pdfFile.name.replace('.pdf', ''),
        gameType: type as "mcq" | "open_ended",
        level,
        pdfName: pdfFile.name,
        pdfUrl: pdfUrl,
      },
    });

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

    return NextResponse.json({ gameId: game.id }, { status: 200 });
  } catch (error) {
    console.error("Error processing PDF quiz:", error);
    return NextResponse.json(
      { error: "Failed to process PDF and create quiz" },
      { status: 500 }
    );
  }
}