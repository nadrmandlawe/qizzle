import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { NextResponse } from "next/server";
import { z } from "zod";
import axios from "axios";

export async function POST(req: Request, res: Response) {
  try {
    // Verify database connection
    try {
      await prisma.$connect();
      console.log("Database connection successful");
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        { error: "Failed to connect to database" },
        { status: 500 }
      );
    }

    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a game." },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();
    const { topic, type, amount, level } = quizCreationSchema.parse(body);

    // Validate level
    const validLevels = ["beginner", "intermediate", "expert"];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: `Invalid level: ${level}` },
        { status: 400 }
      );
    }

    console.log("Creating game with data:", {
      gameType: type,
      userId: session.user.id,
      topic,
      level,
    });

    const game = await prisma.game.create({
      data: {
        gameType: type,
        timeStarted: new Date(),
        userId: session.user.id,
        topic,
        level,
      },
    });

    console.log("Game created:", game);

    await prisma.topic_count.upsert({
      where: {
        topic,
      },
      create: {
        topic,
        count: 1,
      },
      update: {
        count: {
          increment: 1,
        },
      },
    });

    const { data } = await axios.post(
      `${process.env.API_URL as string}/api/questions`,
      {
        amount,
        topic,
        type,
        level,
      }
    );

    if (type === "mcq") {
      type mcqQuestion = {
        question: string;
        answer: string;
        option1: string;
        option2: string;
        option3: string;
      };

      const manyData = data.questions.map((question: mcqQuestion) => {
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
    } else if (type === "open_ended") {
      type openQuestion = {
        question: string;
        answer: string;
      };
      await prisma.question.createMany({
        data: data.questions.map((question: openQuestion) => {
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
    console.error("Error in game creation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "An unexpected error occurred" },
        {
          status: 500,
        }
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view games." },
        {
          status: 401,
        }
      );
    }
    const url = new URL(req.url);
    const gameId = url.searchParams.get("gameId");
    if (!gameId) {
      return NextResponse.json(
        { error: "You must provide a game id." },
        {
          status: 400,
        }
      );
    }

    const game = await prisma.game.findUnique({
      where: {
        id: gameId,
      },
      include: {
        questions: true,
      },
    });
    if (!game) {
      return NextResponse.json(
        { error: "Game not found." },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      { game },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in GET game:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      {
        status: 500,
      }
    );
  }
}