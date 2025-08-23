"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Download, FileText, Loader2, LucideLayoutDashboard } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import AccuracyCard from "@/components/statistics/accuracy-card";
import QuestionsList from "@/components/statistics/questions-list";
import ResultsCard from "@/components/statistics/results-card";
import TimeTakenCard from "@/components/statistics/time-taken-card";
import { useToast } from "@/components/ui/use-toast";
import { Game, Question } from "@prisma/client";

type Props = {
  params: Promise<{
    gameId: string;
  }>;
};

type GameWithQuestions = Game & {
  questions: Question[];
};

const Statistics = ({ params }: Props) => {
  const resolvedParams = React.use(params);
  const { gameId } = resolvedParams;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [game, setGame] = useState<GameWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/game?gameId=${gameId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch game');
        }
        const data = await response.json();
        setGame(data.game);
      } catch (error) {
        console.error('Error fetching game:', error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchGame();
    }
  }, [gameId, status, router]);

  const handleDownload = async () => {
    if (!game?.id) return;
    
    try {
      setIsDownloading(true);
      setDownloadComplete(false);
      const response = await fetch(`/api/pdf-download/${game.id}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = game.pdfName || 'download.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadComplete(true);
      setTimeout(() => {
        setDownloadComplete(false);
      }, 3000); // Reset check icon after 3 seconds
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download the PDF file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!game) {
    return null;
  }

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
  
  accuracy = Math.round(accuracy * 100) / 100;

  return (
    <>
      <div className="p-8 mx-auto max-w-7xl mt-14 mb-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Summary</h2>
          <div className="flex items-center space-x-4">
          <Link href="/dashboard" className={buttonVariants()}>
          <LucideLayoutDashboard className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {game.pdfName && (
          <Card className="mt-4 mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <CardTitle>PDF Quiz Results</CardTitle>
                  <CardDescription>
                    Questions generated from: {game.pdfName}
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "hover:bg-accent transition-all duration-200",
                  isDownloading && "cursor-not-allowed opacity-50"
                )}
                title="Download PDF"
              >
                {isDownloading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : downloadComplete ? (
                  <div className="text-green-500 transform scale-110 transition-transform duration-200">
                    <Check className="w-5 h-5" />
                  </div>
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </button>
            </CardHeader>
            {/* <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Difficulty:</span>
                  <span className="capitalize">{game.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Questions:</span>
                  <span>{game.questions.length}</span>
                </div>
              </div>
            </CardContent> */}
          </Card>
        )}

        <div className="grid gap-4 mt-4 md:grid-cols-7">
          <ResultsCard accuracy={accuracy} />
          <AccuracyCard accuracy={accuracy} />
          <TimeTakenCard
            timeEnded={new Date(game.timeEnded ?? 0)}
            timeStarted={new Date(game.timeStarted ?? 0)}
          />
        </div>
        <QuestionsList questions={game.questions} />
      </div>
    </>
  );
};

export default Statistics;