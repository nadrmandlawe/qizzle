"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
  topics: string[];
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
};

const TopicFilter = ({ topics, selectedTopic, onTopicChange }: Props) => {
  return (
    <div className="flex items-center space-x-2">
      <p className="text-muted-foreground">Filter by topic:</p>
      <Select value={selectedTopic} onValueChange={onTopicChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a topic" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Topics</SelectItem>
          {topics.map((topic) => (
            <SelectItem key={topic} value={topic}>
              {topic}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TopicFilter; 