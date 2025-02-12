import { strict_output } from "@/lib/gpt";
import { getAuthSession } from "@/lib/nextauth";
import { getQuestionsSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    // if (!session?.user) {
    //   return NextResponse.json(
    //     { error: "You must be logged in to create a game." },
    //     {
    //       status: 401,
    //     }
    //   );
    // }
    const body = await req.json();
    const { amount, topic, type, level } = getQuestionsSchema.parse(body);

    // Map difficulty levels to descriptive phrases
    const difficultyMap = {
      beginner: "basic and simple",
      intermediate: "moderately challenging",
      expert: "very challenging and complex"
    };

    // Map difficulty levels to specific instructions
    const difficultyInstructions = {
      beginner: "Focus on fundamental concepts and basic knowledge. Questions should be straightforward and suitable for beginners.",
      intermediate: "Include some complexity and require deeper understanding. Questions should challenge but not overwhelm.",
      expert: "Test advanced knowledge and critical thinking. Questions should be complex and require deep subject expertise."
    };

    const difficulty = difficultyMap[level as keyof typeof difficultyMap] || "moderately challenging";
    const difficultyInstruction = difficultyInstructions[level as keyof typeof difficultyInstructions] || difficultyInstructions.intermediate;

    let questions;
    if (type === "open_ended") {
      questions = await strict_output(
        `You are a helpful AI that is able to generate ${difficulty} questions and answers. ${difficultyInstruction} The length of each answer should not be more than 15 words, store all the pairs of answers and questions in a JSON array`,
        new Array(amount).fill(
          `Generate a random ${difficulty} open-ended question about ${topic}. Remember to maintain ${level} difficulty level.`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
        }
      );
    } else if (type === "mcq") {
      questions = await strict_output(
        `You are a helpful AI that is able to generate ${difficulty} MCQ questions and answers. ${difficultyInstruction} The length of each answer should not be more than 15 words, store all answers and questions and options in a JSON array`,
        new Array(amount).fill(
          `Generate a random ${difficulty} mcq question about ${topic}. Remember to maintain ${level} difficulty level.`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words",
          option1: "option1 with max length of 15 words",
          option2: "option2 with max length of 15 words",
          option3: "option3 with max length of 15 words",
        }
      );
    }

    return NextResponse.json(
      {
        questions: questions,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues },
        {
          status: 400,
        }
      );
    } else {
      console.error("Error generating questions:", error);
      return NextResponse.json(
        { error: "An unexpected error occurred." },
        {
          status: 500,
        }
      );
    }
  }
}