// "use client";
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import {
//     Form,
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import { quizCreationSchema } from "@/schemas/forms/quiz";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation } from "@tanstack/react-query";
// import axios, { AxiosError } from "axios";
// import { BookOpen, CopyCheck, FileText, Upload } from "lucide-react";
// import { useRouter } from "next/navigation";
// import React from "react";
// import { useDropzone } from "react-dropzone";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Progress } from "../ui/progress";
// import { Separator } from "../ui/separator";
// import { useToast } from "../ui/use-toast";

// import LoadingQuestions from "../loading-questions";

// type Props = {
//   topic: string;
//   level: "beginner" | "intermediate" | "expert";
// };

// type Input = z.infer<typeof quizCreationSchema>;

// const QuizCreation = ({ topic: topicParam, level: levelParam }: Props) => {
//   const router = useRouter();
//   const [showLoader, setShowLoader] = React.useState(false);
//   const [finishedLoading, setFinishedLoading] = React.useState(false);
//   const { toast } = useToast();
//   const { mutate: getQuestions, isLoading } = useMutation({
//     mutationFn: async ({ amount, topic, type, level }: Input) => {
//       const response = await axios.post("/api/game", { amount, topic, type, level });
//       return response.data;
//     },
//   });

//   const form = useForm<Input>({
//     resolver: zodResolver(quizCreationSchema),
//     defaultValues: {
//       topic: topicParam,
//       type: "mcq",
//       amount: 3,
//       level: levelParam,
//     },
//   });

//   const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
//   const [uploadProgress, setUploadProgress] = React.useState(0);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: {
//       'application/pdf': ['.pdf']
//     },
//     maxFiles: 1,
//     onDrop: (acceptedFiles) => {
//       setSelectedFile(acceptedFiles[0]);
//       setUploadProgress(0);
//     }
//   });

//   const onSubmit = async (data: Input) => {
//     setShowLoader(true);
    
//     if (selectedFile) {
//       // Handle PDF quiz creation
//       const formData = new FormData();
//       formData.append('pdf', selectedFile);
//       formData.append('amount', data.amount.toString());
//       formData.append('type', data.type);
//       formData.append('level', data.level);

//       try {
//         const response = await axios.post("/api/pdf-quiz", formData, {
//           onUploadProgress: (progressEvent) => {
//             if (progressEvent.total) {
//               const progress = (progressEvent.loaded / progressEvent.total) * 100;
//               setUploadProgress(progress);
//             }
//           },
//         });
        
//         setFinishedLoading(true);
//         setTimeout(() => {
//           if (data.type === "mcq") {
//             router.push(`/play/mcq/${response.data.gameId}`);
//           } else {
//             router.push(`/play/open-ended/${response.data.gameId}`);
//           }
//         }, 2000);
//       } catch (error) {
//         setShowLoader(false);
//         if (error instanceof AxiosError) {
//           toast({
//             title: "Error",
//             description: error.response?.data.error || "Something went wrong. Please try again later.",
//             variant: "destructive",
//           });
//         }
//       }
//     } else {
//       // Handle regular quiz creation
//       getQuestions(data, {
//         onError: (error) => {
//           setShowLoader(false);
//           if (error instanceof AxiosError) {
//             if (error.response?.status === 500) {
//               toast({
//                 title: "Error",
//                 description: "Something went wrong. Please try again later.",
//                 variant: "destructive",
//               });
//             }
//           }
//         },
//         onSuccess: ({ gameId }: { gameId: string }) => {
//           setFinishedLoading(true);
//           setTimeout(() => {
//             if (data.type === "mcq") {
//               router.push(`/play/mcq/${gameId}`);
//             } else {
//               router.push(`/play/open-ended/${gameId}`);
//             }
//           }, 2000);
//         },
//       });
//     }
//   };
//   form.watch();

//   if (showLoader) {
//     return <LoadingQuestions finished={finishedLoading} />;
//   }

//   return (
//     <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">Quiz Creation</CardTitle>
//           <CardDescription>Choose a topic or upload a PDF</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-6 mb-8 cursor-pointer hover:border-primary transition-colors">
//             <input {...getInputProps()} />
//             <div className="flex flex-col items-center justify-center gap-2">
//               <Upload className="w-8 h-8 text-gray-400" />
//               {isDragActive ? (
//                 <p>Drop the PDF file here</p>
//               ) : (
//                 <>
//                   <p className="text-sm text-gray-600">Drag & drop a PDF file here, or click to select</p>
//                   <p className="text-xs text-gray-400">PDF files only</p>
//                 </>
//               )}
//             </div>
//           </div>
//           {selectedFile && (
//             <div className="mb-8">
//               <Card>
//                 <CardHeader className="flex flex-row items-center gap-4">
//                   <FileText className="w-8 h-8 text-blue-500" />
//                   <div>
//                     <CardTitle>Selected PDF</CardTitle>
//                     <CardDescription>
//                       File: {selectedFile.name}
//                     </CardDescription>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex items-center gap-4">
//                     <div className="flex items-center gap-2">
//                       <span className="text-sm text-muted-foreground">Size:</span>
//                       <span>{Math.round(selectedFile.size / 1024)} KB</span>
//                     </div>
//                   </div>
//                   {uploadProgress > 0 && uploadProgress < 100 && (
//                     <div className="w-full space-y-2 mt-4">
//                       <Progress value={uploadProgress} className="w-full" />
//                       <p className="text-sm text-gray-500">
//                         Uploading: {Math.round(uploadProgress)}%
//                       </p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//               {!selectedFile && (
//                 <FormField
//                   control={form.control}
//                   name="topic"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Topic</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter a topic" {...field} />
//                       </FormControl>
//                       <FormDescription>
//                         Please provide any topic you would like to be quizzed on
//                         here.
//                       </FormDescription>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               )}
//               <FormField
//                 control={form.control}
//                 name="amount"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Number of Questions</FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder="How many questions?"
//                         type="number"
//                         {...field}
//                         onChange={(e) => {
//                           form.setValue("amount", parseInt(e.target.value));
//                         }}
//                         min={1}
//                         max={10}
//                       />
//                     </FormControl>
//                     <FormDescription>
//                       You can choose how many questions you would like to be
//                       quizzed on here.
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="level"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Difficulty Level</FormLabel>
//                     <FormControl>
//                       <Select onValueChange={field.onChange} defaultValue={field.value || "intermediate"}>
//                         <SelectTrigger className="w-full">
//                           <SelectValue placeholder="Select a difficulty level" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="beginner">Beginner</SelectItem>
//                           <SelectItem value="intermediate">Intermediate</SelectItem>
//                           <SelectItem value="expert">Expert</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </FormControl>
//                     <FormDescription>
//                       Select the difficulty level for your quiz questions.
//                     </FormDescription>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="flex justify-between">
//                 <Button
//                   variant={
//                     form.getValues("type") === "mcq" ? "default" : "secondary"
//                   }
//                   className="w-1/2 rounded-none rounded-l-lg h-1/4"
//                   onClick={() => {
//                     form.setValue("type", "mcq");
//                   }}
//                   type="button"
//                 >
//                   <CopyCheck className="w-4 h-4 mr-2" /> Multiple Choice
//                 </Button>
//                 <Separator orientation="vertical" />
//                 <Button
//                   variant={
//                     form.getValues("type") === "open_ended"
//                       ? "default"
//                       : "secondary"
//                   }
//                   className="w-1/2 rounded-none rounded-r-lg h-1/25"
//                   onClick={() => form.setValue("type", "open_ended")}
//                   type="button"
//                 >
//                   <BookOpen className="w-4 h-4 mr-2" /> Open Question
//                 </Button>
//               </div>
//               <Button disabled={isLoading} type="submit">
//                 Submit
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default QuizCreation;