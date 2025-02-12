"use client";

import { useSession } from "next-auth/react";
import React from "react";
import AuthButton from "./test";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
 
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { status } = useSession();

  const menuItems = [
    {
      label: "Home",
      href: "/",
    },
  ];

  if (status === "authenticated") {
    menuItems.push(
      {
        label: "Profile",
        href: "/profile",
      },
      {
        label: "Guestbook",
        href: "/guestbook",
      }
    );
  }
  
  return (
    // <div className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[20] h-fit border-b border-zinc-300 py-2">
    //   <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto max-w-7xl">
    //     <Link
    //       href={"/"}
    //       className="flex items-center gap-2"
    //     >
    //       <p className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white">
    //         Quizmify
    //       </p>
    //     </Link>
    //     <div className="flex items-center">
    //       <ThemeToggle />
    //       <AuthButton minimal={false}/>
    //       {/* {status === "loading" ? (
    //         <div className="size-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
    //       ) : session?.user ? (
    //         <UserAccountNav user={session.user} />
    //       ) : (
    //         <SignInButton text="Sign In" />
    //       )} */}
    //     </div>
    //   </div>
    // </div>
    <NavigationMenu className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[20] border-b h-fit border-zinc-300 py-2 min-w-full flex items-center justify-between">
  <NavigationMenuList className="flex items-center justify-between h-full gap-2 px-8 mx-auto ">
  <NavigationMenuItem className="flex items-center gap-2">
  <Link href="/dashboard" legacyBehavior passHref>
    <NavigationMenuLink className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white">
    Quizmify
    </NavigationMenuLink>
  </Link>
</NavigationMenuItem>




  </NavigationMenuList >
  <NavigationMenuList className="flex items-center justify-between h-full gap-2 px-8 mx-auto ">
    <NavigationMenuItem>
    <ThemeToggle />
    </NavigationMenuItem>

    <NavigationMenuItem>
    <AuthButton minimal={false}/>
    </NavigationMenuItem>
    </NavigationMenuList>
</NavigationMenu>
  );
};

export default Navbar;
