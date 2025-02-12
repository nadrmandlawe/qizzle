import { cn } from "@/lib/utils";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/use-toast";
import { z } from "zod";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { useState } from "react";

type Props = {
  topic: string;
};

type Input = z.infer<typeof quizCreationSchema>;

export const QuizCreation = ({ topic: topicParam }: Props) => {
  const router = useRouter();
  const { toast } = useToast();
  const [topic, setTopic] = useState(topicParam);
  const [amount, setAmount] = useState(3);
  const [type, setType] = useState<"mcq" | "open_ended">("mcq");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "expert">("intermediate");

  const { mutate: getQuestions, isLoading } = useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/game", {
        topic,
        amount,
        type,
        level,
      });
      return response.data;
    },
  });

  const handleSubmit = () => {
    if (!topic) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive",
      });
      return;
    }
    getQuestions(undefined, {
      onSuccess: ({ gameId }) => {
        router.push(`/play/${gameId}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Something went wrong! Please try again later.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card className="w-[300px] sm:w-[500px]">
        <div className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-2xl font-bold">Quiz Creation</h1>
            <div className="flex flex-col items-start w-full gap-4">
              <Label>Topic</Label>
              <Input
                placeholder="Enter a topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Please provide any topic you would like to be quizzed on here.
              </p>
            </div>

            <div className="flex flex-col items-start w-full gap-4">
              <Label>Number of Questions</Label>
              <Input
                placeholder="Enter an amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={10}
                min={1}
              />
              <p className="text-sm text-muted-foreground">
                You can choose how many questions you would like to be quizzed on here.
              </p>
            </div>

            <div className="flex flex-col items-start w-full gap-4">
              <Label>Difficulty Level</Label>
              <Select
                value={level}
                onValueChange={(value: "beginner" | "intermediate" | "expert") => setLevel(value)}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner" className="cursor-pointer hover:bg-accent">
                    Beginner
                  </SelectItem>
                  <SelectItem value="intermediate" className="cursor-pointer hover:bg-accent">
                    Intermediate
                  </SelectItem>
                  <SelectItem value="expert" className="cursor-pointer hover:bg-accent">
                    Expert
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Select the difficulty level of the questions.
              </p>
            </div>

            <div className="w-full flex flex-col gap-4">
              <div className="flex justify-between">
                <Button
                  variant={type === "mcq" ? "default" : "outline"}
                  className="w-1/2 rounded-r-none"
                  onClick={() => setType("mcq")}
                >
                  <span className="mr-2">Multiple Choice</span>
                </Button>
                <Button
                  variant={type === "open_ended" ? "default" : "outline"}
                  className="w-1/2 rounded-l-none"
                  onClick={() => setType("open_ended")}
                >
                  <span className="mr-2">Open Ended</span>
                </Button>
              </div>
            </div>

            <Button
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full"
            >
              Submit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}; 