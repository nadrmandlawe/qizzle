"use client";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Question } from "@prisma/client";

type Props = {
  questions: Question[];
};

const QuestionsList = ({ questions }: Props) => {
  return (
    <Table className="mt-4">
      <TableCaption>End of list.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[10px]">No.</TableHead>
          <TableHead>Question & Answer</TableHead>
          <TableHead>Your Answer</TableHead>
          <TableHead className="w-[10px] text-right">Accuracy</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {questions.map((question, index) => {
          return (
            <TableRow key={question.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                {question.question}
                <br />
                <span className="font-semibold">{question.answer}</span>
              </TableCell>
              <TableCell>{question.userAnswer}</TableCell>
              <TableCell className="text-right">
                {question.isCorrect !== null ? (
                  <span
                    className={cn("font-semibold", {
                      "text-green-600": question.isCorrect,
                      "text-red-600": !question.isCorrect,
                    })}
                  >
                    {question.isCorrect ? "Correct" : "Incorrect"}
                  </span>
                ) : (
                  <span className="font-semibold">
                    {question.percentageCorrect}%
                  </span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default QuestionsList;