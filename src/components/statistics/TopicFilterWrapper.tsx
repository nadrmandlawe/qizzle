"use client";

import { useRouter } from "next/navigation";
import TopicFilter from "./TopicFilter";

type Props = {
  topics: string[];
  selectedTopic: string;
};

const TopicFilterWrapper = ({ topics, selectedTopic }: Props) => {
  const router = useRouter();

  const handleTopicChange = (topic: string) => {
    const url = new URL(window.location.href);
    if (topic === "all") {
      url.searchParams.delete("topic");
    } else {
      url.searchParams.set("topic", topic);
    }
    router.push(url.pathname + url.search);
  };

  return (
    <TopicFilter
      topics={topics}
      selectedTopic={selectedTopic}
      onTopicChange={handleTopicChange}
    />
  );
};

export default TopicFilterWrapper; 