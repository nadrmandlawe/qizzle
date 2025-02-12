import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/nextauth";
import { Brain } from "lucide-react";
import Link from "next/link";

export default async function NotFound() {
  const session = await getAuthSession();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 relative overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Brain className="w-72 h-72" />
            </div>
            <h1 className="text-8xl font-bold text-primary">404</h1>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg">
            Oops! It seems your quest for knowledge has led you to an unexplored territory. Let's get you back on track.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/">
                Return Home
              </Link>
            </Button>
            {session?.user && (
              <Button variant="outline" asChild size="lg">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-purple-200/50 dark:bg-purple-900/20 rounded-full mix-blend-multiply blur-xl animate-float"></div>
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-blue-200/50 dark:bg-blue-900/20 rounded-full mix-blend-multiply blur-xl animate-float animation-delay-2000"></div>
        </div>
      </div>
    </div>
  );
} 