import React from 'react';
import {signOut, useSession} from 'next-auth/react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import crypto from 'crypto';

export default function NavBar() {
    const { data: session } = useSession();

    const emailmd5 = crypto.createHash('md5').update(session?.user?.email || "null").digest('hex')

    return (
        <div className="w-full h-16 flex justify-between items-center px-4">
            <Link href={"/home"} className={"text-md font-medium"}>
                Leftovers Love
            </Link>
            {session ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2">
                            <span>{session.user?.name}</span>
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={`https://www.gravatar.com/avatar/${emailmd5}`}
                                    alt={session.user?.name || 'User avatar'}
                                />
                                <AvatarFallback>
                                    {session.user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {}}>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {}}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button asChild>
                    <Link href={'/auth'} passHref>
                        Sign In
                    </Link>
                </Button>
            )}
        </div>
    );
}