import SignInButton from "@/components/sign-in-button";
import StartLearningButton from "@/components/start-learning-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/nextauth";
import { Brain, Calculator, History as HistoryIcon, Palette, Sparkles, Target, TestTube, Zap } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getAuthSession();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden flex flex-col">
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-5">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold">Quizmify</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">About</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Features</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">Blog</a>
          <SignInButton text="Sign up" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4">
        <div className="text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Welcome to Quizmify
            <span className="block text-primary mt-2">Learn Smarter, Not Harder</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Join thousands of learners on Quizmify and experience the future of personalized learning. 
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

          {/* Card 2 - Topics */}
          <Card className="border-0 shadow-lg lg:translate-y-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl items-center justify-center flex flex-col">
            <CardHeader>
              <CardTitle>Popular Topics on Quizmify</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl hover:scale-105 transition-transform cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                  <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium">Mathematics</span>
                <span className="text-xs text-gray-500 mt-1">500+ Quizzes</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl hover:scale-105 transition-transform cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                  <TestTube className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium">Science</span>
                <span className="text-xs text-gray-500 mt-1">450+ Quizzes</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl hover:scale-105 transition-transform cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                  <HistoryIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium">History</span>
                <span className="text-xs text-gray-500 mt-1">300+ Quizzes</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl hover:scale-105 transition-transform cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
                  <Palette className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-sm font-medium">Arts</span>
                <span className="text-xs text-gray-500 mt-1">250+ Quizzes</span>
              </div>
            </CardContent>
            <CardFooter>
              <StartLearningButton />
            </CardFooter>
          </Card>

          {/* Card 3 - Smart Features */}
          <Card className="border-0 shadow-lg lg:translate-y-16 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl items-center justify-center flex flex-col">
            <CardHeader>
              <CardTitle>Why Choose Quizmify?</CardTitle>
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
                  <p className="text-sm font-medium">Adaptive Difficulty</p>
                  <p className="text-xs text-gray-500">Grows with your knowledge</p>
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