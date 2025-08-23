import MCQ from "@/components/mcq";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";

type Params = {
  gameId: string;
};

type Props = {
  params: Promise<Params>;
};

const MCQPage = async (props: Props) => {
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
          options: true,
        },
      },
    },
  });

  if (!game || game.gameType === "open_ended") {
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
      <MCQ game={game} />
    </div>
  );
};

export default MCQPage;