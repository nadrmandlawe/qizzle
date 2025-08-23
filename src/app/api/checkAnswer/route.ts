import { prisma } from "@/lib/db";
import { checkAnswerSchema } from "@/schemas/questions";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

function compareAnswers(correctAnswer: string, userAnswer: string): number {
  // Normalize both answers
  const normalizeText = (text: string) => {
    return text.toLowerCase()
      .trim()
      .replace(/[.,;!?]$/g, '') // Remove punctuation at the end
      .replace(/\s+/g, ' '); // Normalize spaces
  };

  const correct = normalizeText(correctAnswer);
  const user = normalizeText(userAnswer);

  // If answers are exactly the same
  if (correct === user) {
    return 100;
  }

  // Split into words and filter out common words
  const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const getSignificantWords = (text: string) => {
    return text.split(' ').filter(word => 
      word.length > 2 && !commonWords.has(word)
    );
  };

  const correctWords = getSignificantWords(correct);
  const userWords = getSignificantWords(user);

  if (correctWords.length === 0 || userWords.length === 0) {
    return 0;
  }

  // Calculate key concept matches
  const getKeyConcepts = (words: string[]) => {
    // Join consecutive technical terms
    const concepts: string[] = [];
    let currentConcept = '';
    
    words.forEach((word, index) => {
      if (word.length > 3 || /[A-Z_]/.test(word)) { // Technical terms often have capitals or underscores
        currentConcept += (currentConcept ? ' ' : '') + word;
      } else if (currentConcept) {
        concepts.push(currentConcept);
        currentConcept = '';
      }
    });
    if (currentConcept) {
      concepts.push(currentConcept);
    }
    return concepts;
  };

  const correctConcepts = getKeyConcepts(correctWords);
  const userConcepts = getKeyConcepts(userWords);

  // Calculate concept match score
  const conceptMatches = correctConcepts.filter(concept => 
    userConcepts.some(userConcept => 
      userConcept.includes(concept) || concept.includes(userConcept)
    )
  );
  const conceptScore = (conceptMatches.length / correctConcepts.length) * 100;

  // Calculate word order score
  let orderScore = 0;
  let longestSequence = 0;
  let currentSequence = 0;
  
  correctWords.forEach((word, index) => {
    const userIndex = userWords.indexOf(word);
    if (userIndex !== -1) {
      // Check if the next word also matches in sequence
      if (index > 0 && userIndex > 0) {
        const prevCorrectWord = correctWords[index - 1];
        const prevUserWord = userWords[userIndex - 1];
        if (prevCorrectWord === prevUserWord) {
          currentSequence++;
        } else {
          currentSequence = 1;
        }
      } else {
        currentSequence = 1;
      }
      longestSequence = Math.max(longestSequence, currentSequence);
    }
  });
  
  orderScore = (longestSequence / correctWords.length) * 100;

  // Calculate word coverage
  const wordMatches = correctWords.filter(word => userWords.includes(word));
  const coverageScore = (wordMatches.length / correctWords.length) * 100;

  // Weighted final score
  const finalScore = Math.round(
    (conceptScore * 0.5) +    // Key concepts are most important
    (coverageScore * 0.3) +   // Overall word coverage
    (orderScore * 0.2)        // Word order matters less but still counts
  );

  // Thresholds for more accurate scoring
  if (finalScore < 25) return 0;
  if (finalScore > 85) return 100;

  return finalScore;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questionId, userInput } = checkAnswerSchema.parse(body);
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json(
        {
          message: "Question not found",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.question.update({
      where: { id: questionId },
      data: { userAnswer: userInput },
    });

    if (question.questionType === "mcq") {
      const isCorrect =
        question.answer.toLowerCase().trim() === userInput.toLowerCase().trim();
      await prisma.question.update({
        where: { id: questionId },
        data: { isCorrect },
      });
      return NextResponse.json({
        isCorrect,
      });
    } else if (question.questionType === "open_ended") {
      const percentageSimilar = compareAnswers(question.answer, userInput);
      await prisma.question.update({
        where: { id: questionId },
        data: { percentageCorrect: percentageSimilar },
      });
      return NextResponse.json({
        percentageSimilar,
      });
    } else {
      // Add this return statement for other question types
      return NextResponse.json(
        {
          message: "Unsupported question type",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: error.issues,
        },
        {
          status: 400,
        }
      );
    }
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
      },
      {
        status: 500,
      }
    );
  }
}