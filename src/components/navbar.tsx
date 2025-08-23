
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import AuthButton from "./auth-button";
import { ThemeToggle } from "./theme-toggle";
import UserAccountNav from "./user-account-nav";
import { useSession } from "next-auth/react";

const Navbar = () => {

  return (
    <NavigationMenu className="fixed inset-x-0 top-0 bg-white dark:bg-gray-950 z-[20] border-b h-fit border-zinc-300 py-2 min-w-full flex items-center justify-between">
      <NavigationMenuList className="flex items-center justify-between h-full gap-2 px-8 mx-auto">
        <NavigationMenuItem className="flex items-center gap-2">
        <Link href="/dashboard" passHref>
  <NavigationMenuLink className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white">
    Qizzle
  </NavigationMenuLink>
</Link>
        </NavigationMenuItem>
      </NavigationMenuList>

      <NavigationMenuList className="flex items-center justify-center h-full px-8 mx-auto gap-2">
        <NavigationMenuItem>
          <ThemeToggle />
        </NavigationMenuItem>

        <NavigationMenuItem className="flex items-center">
          {/* <AuthButton minimal={false}/> */}
          <UserAccountNav/>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Navbar;
