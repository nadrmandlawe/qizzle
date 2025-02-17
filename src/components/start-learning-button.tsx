"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

type props = {
  label: string;
  icon?: React.ReactNode;
}

const StartLearningButton = ({ label, icon }: props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      await signIn("google");
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <Button 
      className="w-full" 
      size="lg" 
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="size-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
{/* Explore All Topics on Qizzle */}
{icon}
         {label}
        </>
      )}
    </Button>
  );
};

export default StartLearningButton; 