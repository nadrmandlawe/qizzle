import StartLearningButton from "@/components/start-learning-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/nextauth";
import { Brain, FileText, Sparkles, Target, Upload, Zap } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className=" bg-white dark:bg-gray-950  flex flex-col  items-center justify-center min-h-dvh mt-20 lg:mt-0">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        <div className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Welcome to Qizzle
            <span className="block text-primary mt-2">Learn Smarter, Not Harder</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of learners on Qizzle and experience the future of personalized learning. 
            Master any topic through AI-powered quizzes tailored just for you.
          </p>
        </div>

        {/* Feature Cards - Stacked Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          {/* Card 1 - AI Card */}
          <Card className="border-0 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl items-center justify-center flex flex-col">
            <CardHeader>
              <CardTitle>AI-Powered Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-6 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Powered by</span>
                  <span className="text-lg font-bold">Google Gemini</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <Sparkles className="w-5 h-5 mr-3 text-green-500" />
                  <span>Questions tailored to your learning style</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <Target className="w-5 h-5 mr-3 text-green-500" />
                  <span>Instant feedback and explanations</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <Zap className="w-5 h-5 mr-3 text-green-500" />
                  <span>Adaptive learning paths</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <Brain className="w-5 h-5 mr-3 text-green-500" />
                  <span>Smart topic suggestions based on performance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2 - PDF Quiz Feature */}
          <Card className="border-0 shadow-lg lg:translate-y-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl items-center justify-center flex flex-col">
            <CardHeader>
              <CardTitle>Create Quizzes from PDFs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-6 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">PDF to Quiz</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Transform your documents</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <Upload className="w-5 h-5 mr-3 text-purple-500" />
                  <span>Upload any PDF and create instant quizzes</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <Brain className="w-5 h-5 mr-3 text-purple-500" />
                  <span>AI generates relevant questions</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <FileText className="w-5 h-5 mr-3 text-purple-500" />
                  <span>Perfect for study materials and textbooks</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                  <Zap className="w-5 h-5 mr-3 text-purple-500" />
                  <span>Get instant quiz results and feedback</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <StartLearningButton label="Explore All Topics on Qizzle" />
            </CardFooter>
          </Card>

          {/* Card 3 - Smart Features */}
          <Card className="border-0 shadow-lg lg:translate-y-16 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl items-center justify-center flex flex-col">
            <CardHeader>
              <CardTitle>Why Choose Qizzle?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Brain className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Smart Learning</p>
                  <p className="text-xs text-gray-500">AI-powered personalization</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Multiple Quiz Types</p>
                  <p className="text-xs text-gray-500">MCQ and Open-ended questions</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Progress Tracking</p>
                  <p className="text-xs text-gray-500">Real-time performance insights</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Instant Results</p>
                  <p className="text-xs text-gray-500">Get detailed feedback immediately</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-200/50 dark:bg-purple-900/20 rounded-full mix-blend-multiply blur-xl animate-float"></div>
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-blue-200/50 dark:bg-blue-900/20 rounded-full mix-blend-multiply blur-xl animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-72 h-72 bg-green-200/50 dark:bg-green-900/20 rounded-full mix-blend-multiply blur-xl animate-float animation-delay-4000"></div>
        </div>
      </div>
    </div>
  );
}