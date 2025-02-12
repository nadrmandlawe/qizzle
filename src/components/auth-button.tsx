"use client";

import { LogOut } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "./ui/button";
import UserAccountNav from "./user-account-nav";

type Props = {
  minimal?: boolean;
};

const AuthButton = ({ minimal = false }: Props) => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="size-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
    );
  }

  if (session?.user) {
    if (minimal) {
      return (
        <Button
          variant="ghost"
          onClick={() => {
            signOut();
          }}
        >
          <LogOut className="size-4" />
        </Button>
      );
    }

    return <UserAccountNav user={session.user} />;
  }

  return (
    <Button
      onClick={() => {
        signIn("google");
      }}
    >
      Sign In
    </Button>
  );
};

export default AuthButton;