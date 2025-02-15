"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { quizCreationSchema } from "@/schemas/forms/quiz";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { BookOpen, CopyCheck, FileUp, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useDropzone } from "react-dropzone";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import LoadingQuestions from "../loading-questions";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { useToast } from "../ui/use-toast";

type Props = {
  topic: string;
  level: "beginner" | "intermediate" | "expert";
};

type Input = z.infer<typeof quizCreationSchema>;

const QuizCreation = ({ topic: topicParam, level: levelParam }: Props) => {
  const router = useRouter();
  const [showLoader, setShowLoader] = React.useState(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress(0); // Reset progress when new file is selected
    }
  });

  const { mutate: getQuestions, isLoading } = useMutation({
    mutationFn: async ({ amount, topic, type, level }: Input) => {
      const response = await axios.post("/api/game", { amount, topic, type, level });
      return response.data;
    },
  });

  const methods = useForm<Input>({
    resolver: zodResolver(quizCreationSchema),
    defaultValues: {
      topic: topicParam,
      type: "mcq",
      amount: 3,
      level: levelParam,
    },
  });

  const onSubmit = async (data: Input) => {
    setShowLoader(true);
    getQuestions(data, {
      onError: (error) => {
        setShowLoader(false);
        if (error instanceof AxiosError) {
          if (error.response?.status === 500) {
            toast({
              title: "Error",
              description: "Something went wrong. Please try again later.",
              variant: "destructive",
            });
          }
        }
      },
      onSuccess: ({ gameId }: { gameId: string }) => {
        setFinishedLoading(true);
        setTimeout(() => {
          if (methods.getValues("type") === "mcq") {
            router.push(`/play/mcq/${gameId}`);
          } else if (methods.getValues("type") === "open_ended") {
            router.push(`/play/open-ended/${gameId}`);
          }
        }, 2000);
      },
    });
  };

  const handlePDFUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file first.",
        variant: "destructive",
      });
      return;
    }

    setShowLoader(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('amount', methods.getValues("amount").toString());
    formData.append('type', methods.getValues("type"));
    formData.append('level', methods.getValues("level"));

    try {
      const response = await axios.post("/api/pdf-quiz", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        },
      });
      setFinishedLoading(true);
      setTimeout(() => {
        if (methods.getValues("type") === "mcq") {
          router.push(`/play/mcq/${response.data.gameId}`);
        } else if (methods.getValues("type") === "open_ended") {
          router.push(`/play/open-ended/${response.data.gameId}`);
        }
      }, 2000);
    } catch (error) {
      setShowLoader(false);
      setUploadProgress(0);
      toast({
        title: "Error",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  methods.watch();

  if (showLoader) {
    return <LoadingQuestions finished={finishedLoading} />;
  }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quiz Creation</CardTitle>
          <CardDescription>Choose your quiz creation method</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="topic">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="topic">By Topic</TabsTrigger>
              <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
            </TabsList>

            <TabsContent value="topic">
              <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={methods.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a topic" {...field} />
                        </FormControl>
                        <FormDescription>
                          Please provide any topic you would like to be quizzed on
                          here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={methods.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="How many questions?"
                            type="number"
                            {...field}
                            onChange={(e) => {
                              methods.setValue("amount", parseInt(e.target.value));
                            }}
                            min={1}
                            max={10}
                          />
                        </FormControl>
                        <FormDescription>
                          You can choose how many questions you would like to be
                          quizzed on here.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={methods.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a difficulty level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Select the difficulty level of the questions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      variant={
                        methods.getValues("type") === "mcq" ? "default" : "secondary"
                      }
                      className="w-1/2 rounded-none rounded-l-lg h-1/4"
                      onClick={() => {
                        methods.setValue("type", "mcq");
                      }}
                      type="button"
                    >
                      <CopyCheck className="w-4 h-4 mr-2" /> Multiple Choice
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      variant={
                        methods.getValues("type") === "open_ended"
                          ? "default"
                          : "secondary"
                      }
                      className="w-1/2 rounded-none rounded-r-lg h-1/25"
                      onClick={() => methods.setValue("type", "open_ended")}
                      type="button"
                    >
                      <BookOpen className="w-4 h-4 mr-2" /> Open Question
                    </Button>
                  </div>
                  <Button disabled={isLoading} type="submit" className="w-full">
                    Submit
                  </Button>
                </form>
              </FormProvider>
            </TabsContent>

            <TabsContent value="pdf">
              <FormProvider {...methods}>
                <div className="space-y-8">
                  <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-6 cursor-pointer text-center transition-colors
                      ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700'}
                      ${selectedFile ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}
                  >
                    <input {...getInputProps()} />
                    <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    {selectedFile ? (
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Selected: {selectedFile.name}
                        </p>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full space-y-2">
                            <Progress value={uploadProgress} className="w-full" />
                            <p className="text-sm text-gray-500">
                              Uploading: {Math.round(uploadProgress)}%
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Drag & drop a PDF file here, or click to select
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Only PDF files are accepted
                        </p>
                      </div>
                    )}
                  </div>

                  <FormField
                    control={methods.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="How many questions?"
                            type="number"
                            {...field}
                            onChange={(e) => {
                              methods.setValue("amount", parseInt(e.target.value));
                            }}
                            min={1}
                            max={10}
                          />
                        </FormControl>
                        <FormDescription>
                          Select how many questions to generate from the PDF
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button
                      variant={
                        methods.getValues("type") === "mcq" ? "default" : "secondary"
                      }
                      className="w-1/2 rounded-none rounded-l-lg h-1/4"
                      onClick={() => {
                        methods.setValue("type", "mcq");
                      }}
                      type="button"
                    >
                      <CopyCheck className="w-4 h-4 mr-2" /> Multiple Choice
                    </Button>
                    <Separator orientation="vertical" />
                    <Button
                      variant={
                        methods.getValues("type") === "open_ended"
                          ? "default"
                          : "secondary"
                      }
                      className="w-1/2 rounded-none rounded-r-lg h-1/25"
                      onClick={() => methods.setValue("type", "open_ended")}
                      type="button"
                    >
                      <BookOpen className="w-4 h-4 mr-2" /> Open Question
                    </Button>
                  </div>

                  <Button 
                    onClick={handlePDFUpload} 
                    disabled={!selectedFile || isLoading}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Create Quiz from PDF
                  </Button>
                </div>
              </FormProvider>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizCreation; 