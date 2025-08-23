import HistoryComponent from "@/components/history-component";
import TopicFilterWrapper from "@/components/statistics/topic-filter-wrapper";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { LucideLayoutDashboard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type SearchParams = {
  topic?: string;
  [key: string]: string | undefined;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

const History = async (props: Props) => {
  const searchParams = await props.searchParams;
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }

  // Get all user's topics
  const userGames = await prisma.game.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      topic: true,
    },
    distinct: ["topic"],
  });

  const topics = userGames
    .map((game: { topic: string }) => game.topic)
    .sort((a: string, b: string) => a.localeCompare(b)); // Sort alphabetically
  const selectedTopic = searchParams.topic || "all";

  return (
    <main className="p-8 mx-auto max-w-7xl mt-14 flex flex-col h-full">
      <div className="flex items-start md:items-center justify-between mb-8 flex-col md:flex-row gap-4">
      <div className="flex items-start flex-col gap-4">
           <h2 className="text-3xl font-bold tracking-tight">
             {selectedTopic === "all" ? "History" : `History for ${selectedTopic}`}
           </h2>
             <TopicFilterWrapper 
               topics={topics}
               selectedTopic={selectedTopic}
             />
         </div>
         <Link className={buttonVariants()} href="/dashboard" legacyBehavior>
               <LucideLayoutDashboard className="mr-2" />
               Back to Dashboard
             </Link>
      </div>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        <HistoryComponent 
          limit={100} 
          userId={session.user.id} 
          topic={selectedTopic}
        />
      </div>
    </main>
  );
};

export default History;