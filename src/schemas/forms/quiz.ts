import { z } from "zod";

export const quizCreationSchema = z.object({
  topic: z
    .string()
    .min(4, {
      message: "Topic must be at least 4 characters long",
    })
    .max(50, {
      message: "Topic must be at most 50 characters long",
    }),
  type: z.enum(["mcq", "open_ended"]),
  amount: z.number().min(1, {message: "Amount must be at least 1"}).max(10, {message: "Amount must be at most 10"}),
  level: z.enum(["beginner", "intermediate", "expert"]).default("intermediate"),
});