import { prisma } from "@/lib/db";
import { Game, Question } from "@prisma/client";
import { formatDistance } from "date-fns";
import { Clock, CopyCheck, Edit2, Target } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

type Props = {
  limit: number;
  userId: string;
  topic?: string;
};

type GameWithQuestions = Game & {
  questions: Question[];
};

const HistoryComponent = async ({ limit, userId, topic }: Props) => {
  const games = await prisma.game.findMany({
    take: limit,
    where: {
      userId,
      ...(topic && topic !== "all" ? { topic } : {}),
    },
    orderBy: {
      timeStarted: "desc",
    },
    include: {
      questions: true
    }
  });

  return (
    <>
      {games.map((game: GameWithQuestions) => {
        let accuracy: number = 0;
        
        if (game.gameType === "mcq") {
          const totalCorrect = game.questions.reduce((acc: number, question: Question) => {
            if (question.isCorrect) {
              return acc + 1;
            }
            return acc;
          }, 0);
          accuracy = (totalCorrect / game.questions.length) * 100;
        } else {
          const totalPercentage = game.questions.reduce((acc: number, question: Question) => {
            return acc + (question.percentageCorrect ?? 0);
          }, 0);
          accuracy = totalPercentage / game.questions.length;
        }

        return (
          <Card key={game.id} className="break-inside-avoid mb-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-bold">
                <Link 
                  href={`/statistics/${game.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {game.topic}
                </Link>
              </CardTitle>
              <div className="flex items-center gap-2">
                {game.gameType === "mcq" ? (
                  <CopyCheck className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDistance(new Date(game.timeStarted), new Date(), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4" />
                  <span className={accuracy >= 75 ? "text-green-500" : accuracy >= 50 ? "text-yellow-500" : "text-red-500"}>
                    {accuracy.toFixed(1)}% accuracy
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-muted-foreground">
                  {game.gameType === "mcq" ? "Multiple Choice" : "Open-Ended"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {game.questions.length} questions
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};

export default HistoryComponent;