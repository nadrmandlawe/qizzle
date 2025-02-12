import QuizCreation from "@/components/forms/quiz-creation";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Quiz | Quizmify",
  description: "Quiz yourself on anything!"
};

type SearchParams = {
  topic?: string;
  level?: "beginner" | "intermediate" | "expert";
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Quiz = async (props: Props) => {
  const searchParams = await props.searchParams;
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }
  return <QuizCreation topic={searchParams.topic ?? ""} level={searchParams.level ?? "intermediate"} />;
};

export default Quiz;