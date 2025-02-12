'use client';
import React from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = { text: string };

const SignInButton = ({ text }: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: `${window.location.origin}/dashboard`,
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="ml-3"
    >
      {isLoading ? "Signing in..." : text}
    </Button>
  );
};

export default SignInButton;