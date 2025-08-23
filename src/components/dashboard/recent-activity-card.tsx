import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import HistoryComponent from "../history-component";
import { ScrollArea } from "../ui/scroll-area";

type Props = {};

const RecentActivityCard = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }
  const games_count = await prisma.game.count({
    where: {
      userId: session.user.id,
    },
  });
  return (
    // <Card className="col-span-4 lg:col-span-3">
    //   <CardHeader>
    //     <CardTitle className="text-2xl font-bold">
    //       <Link href="/history">Recent Activity</Link>
    //     </CardTitle>
    //     <CardDescription>
    //       You have played a total of {games_count} quizzes.
    //     </CardDescription>
    //   </CardHeader>
    //   <CardContent className=" overflow-y-auto">
    //     <HistoryComponent limit={10} userId={session.user.id} />
    //   </CardContent>
    // </Card>
    <ScrollArea className="rounded-md border h-[700px]">
      <div className="sticky top-0 bg-background p-4 w-full rounded-md">
 <h1 className="text-2xl font-bold">Recent Activity</h1>
 <p className="text-sm text-muted-foreground">
 You have played a total of {games_count} quizzes.
   </p>
 </div>
      <div className="p-4 ">
   
        <HistoryComponent limit={10} userId={session.user.id} />
      </div>
    </ScrollArea>
  );
};

export default RecentActivityCard;