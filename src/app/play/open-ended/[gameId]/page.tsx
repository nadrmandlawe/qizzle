import OpenEnded from "@/components/open-ended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { FileText } from "lucide-react";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    gameId: string;
  }>;
};

const OpenEndedPage = async (props: Props) => {
  const params = await props.params;
  const { gameId } = params;

  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: gameId,
    },
    include: {
      questions: {
        select: {
          id: true,
          question: true,
          answer: true,
        },
      },
    },
  });

  if (!game || game.gameType === "mcq") {
    return redirect("/quiz");
  }

  return (
    <div className="max-w-7xl mx-auto p-8 mt-16">
      {/* {game.pdfName && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <CardTitle>PDF Quiz</CardTitle>
              <CardDescription>
                Questions generated from: {game.pdfName}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )} */}
      <OpenEnded game={game} />
    </div>
  );
};

export default OpenEndedPage;