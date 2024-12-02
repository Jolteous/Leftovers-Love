import React from "react";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import crypto from "crypto";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const { data: session } = useSession();
  const router = useRouter();

  const emailmd5 = crypto
    .createHash("md5")
    .update(session?.user?.email || "null")
    .digest("hex");

  return (
    <div className="w-full h-16 flex justify-between items-center px-4">
      <Link href={"/home"} className={"text-md font-medium"}>
        Leftovers Love
      </Link>
      {session ? (
        <div className="flex justify-center items-center" >
          <div className="flex space-x-2">
            <Link href={"/home"} className="text-md font-medium">
              Home
            </Link>
            <Link href={"/favorites"} className="text-md font-medium">
              Favorites
            </Link>
            <Link href={"/donate"} className="text-md font-medium">
              Donate
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <span>{session.user?.name}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`https://www.gravatar.com/avatar/${emailmd5}`}
                    alt={session.user?.name || "User avatar"}
                  />
                  <AvatarFallback>
                    {session.user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {}}>Profile</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  router.push("/settings");
                }}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Button asChild>
          <Link href={"/auth"} passHref>
            Sign In
          </Link>
        </Button>
      )}
    </div>
  );
}
