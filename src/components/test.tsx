"use client";


import { PersonStanding } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";

export default function AuthButton({ minimal = true }: { minimal?: boolean }) {
  const { data, status } = useSession();
  const router = useRouter();


  if (status === "loading") {
    return <div aria-label="Loading authentication status..." className="size-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />;
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

    return (
      <DropdownMenu >
        <DropdownMenuTrigger>
        <Avatar>
  <AvatarImage  src={data.user.image!}/>
  <AvatarFallback>CN</AvatarFallback>
</Avatar>
        </DropdownMenuTrigger>
    <DropdownMenuContent aria-label="Profile Actions">
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
          onSelect={(event) => {
            event.preventDefault();
            router.push("/dashboard");
          }}
        >
          Dashboard
        </DropdownMenuItem>

        <DropdownMenuSeparator />
          <DropdownMenuItem key="sign-out" className="cursor-pointer text-red-500" onSelect={signOutClick}>
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
          callbackUrl: "/profile",
        })
      }
      color="danger"
      variant="ghost"
    >
      <PersonStanding/>
      Sign In
    </Button>
  );
}