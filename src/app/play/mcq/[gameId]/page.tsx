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
  return <MCQ game={game} />;
};

export default MCQPage;