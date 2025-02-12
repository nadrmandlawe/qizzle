"use client";

import { IconBrandGoogleFilled, IconLogout } from "@tabler/icons-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function AuthButton({ minimal = true }: { minimal?: boolean }) {
  const { data, status } = useSession();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  if (status === "loading") {
    return <div aria-label="Loading authentication status..." className="size-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />;
  }

  if (status === "authenticated") {
    const signOutClick = () =>
      signOut({
        callbackUrl: "/",
      });
    if (minimal) {
      return (
        <Button onClick={signOutClick} color="danger" variant="ghost">
          Google
          Sign Out
        </Button>
      );
    }

    // Get user's initials for fallback
    const initials = data.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            {!imageError ? (
              <AvatarImage
                src={data.user.image!}
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
              />
            ) : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent aria-label="Profile Actions" className="mr-4">
          <DropdownMenuItem key="profile" className="h-14 gap-2">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {data.user.name && <p className="font-medium">Hi, {data.user.name}</p>}
                {data.user.email && (
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {data.user.email}
                  </p>
                )}
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              router.push("/dashboard");
            }}
          >
            Dashboard
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem key="sign-out" className="cursor-pointer text-red-500 gap-2" onSelect={signOutClick}>
            <IconLogout size={16}/>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() =>
        signIn("google", {
          callbackUrl: "/dashboard",
        })
      }
      variant="ghost"
      className="gap-2"
    >
      <IconBrandGoogleFilled size={18}/>
      Sign In
    </Button>
  );
}