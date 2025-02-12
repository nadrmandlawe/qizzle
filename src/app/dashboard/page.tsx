import HotTopicsCard from "@/components/dashboard/hot-topics-card";
import QuizMeCard from "@/components/dashboard/quiz-me-card";
import RecentActivityCard from "@/components/dashboard/recent-activity-card";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | Quizmify",
  description: "Quiz yourself on anything!"
};

export const dynamic = "force-dynamic";

const Dashboard = async () => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="p-8 mx-auto max-w-7xl mt-14">
      <div className="flex items-center mb-4">
        <h2 className="mr-2 text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        <div className="flex flex-col w-full gap-2 col-span-2">
          <QuizMeCard />
          <HotTopicsCard />
        </div>

        <div className="col-span-2">
          <RecentActivityCard />
        </div>
      </div>
      {/* <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-2 pb-12">
        <div className=" lg:col-span-3 lg:row-span-2">
          <QuizMeCard />
        </div>
        <div className=" lg:col-span-3 lg:row-span-10 lg:row-start-3">
          <HotTopicsCard />
        </div>
        <div className=" lg:col-span-2 lg:row-span-10 lg:col-start-4 lg:row-start-1">
          <RecentActivityCard />
        </div>
      </div> */}
    </main>
  );
};

export default Dashboard;