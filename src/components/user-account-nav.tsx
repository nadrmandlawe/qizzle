"use client";

import { IconBrandGoogleFilled, IconHistory, IconLayoutDashboard, IconPlus } from "@tabler/icons-react";
import { LogOut } from "lucide-react";
import { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import StartLearningButton from "./start-learning-button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type Props = {
  user: Pick<User, "name" | "image" | "email">;
};

const UserAccountNav = () => {
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();



  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";


  if(pathname === "/"){
    return(
      // <Button       onClick={() => {
      //   signIn("google");
      // }}>
      //   <IconBrandGoogleFilled className="size-4 mr-2" />
      //   Sign In
      // </Button>
      <StartLearningButton label="Sign In" icon={<IconBrandGoogleFilled className="size-4 mr-2" />} />
    )
  }

  if(status === "loading"){
    return(
      <div className="size-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          {!imageError ? (
            <AvatarImage
              src={user?.image!}
              onError={() => setImageError(true)}
              referrerPolicy="no-referrer"
            />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mr-4">
        <DropdownMenuItem className="h-14 gap-2">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {user?.name && <p className="font-medium">Hi, {user.name}</p>}
              {user?.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              )}
            </div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onSelect={() => {
       
            router.push("/dashboard");
          }}
        >
          <IconLayoutDashboard className="size-4" />
        Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onSelect={() => {
            router.push("/quiz");
          }}
        >
          <IconPlus className="size-4" />
          Create Quiz
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onSelect={() => {

            router.push("/history");
          }}
        >
          <IconHistory className="size-4" />
          History
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-500 gap-2"
          onSelect={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="size-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;