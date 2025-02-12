import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { topic_count } from "@prisma/client";
import WordCloud from "../word-cloud";

const HotTopicsCard = async () => {
  const topics = await prisma.topic_count.findMany({});
  const formattedTopics = topics.map((topic: topic_count) => {
    return {
      text: topic.topic,
      value: topic.count,
    };
  });

  return (
    <Card className="col-span-4 h-[582px]">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Hot Topics</CardTitle>
        <CardDescription>
          Click on a topic to start a quiz on it.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2 cursor-pointer">
        <WordCloud formattedTopics={formattedTopics} />
      </CardContent>
    </Card>
  );
};

export default HotTopicsCard;