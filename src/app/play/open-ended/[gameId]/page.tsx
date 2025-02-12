import OpenEnded from "@/components/open-ended";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    gameId: string;
  }>;
};

const OpenEndedPage = async (props: Props) => {
  const params = await props.params;

  const {
    gameId
  } = params;

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
  return <OpenEnded game={game} />;
};

export default OpenEndedPage;