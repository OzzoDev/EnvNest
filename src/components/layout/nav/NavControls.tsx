"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, getCurrentLinkName, getLinks } from "@/lib/utils";
import { NextAuthUser } from "@/types/types";
import { ChevronDown } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MoblieNav from "./MoblieNav";
import { useEffect, useState } from "react";

type NavbarControlsProps = {
  user: NextAuthUser | undefined;
};

const NavControls = ({ user }: NavbarControlsProps) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <MoblieNav user={user} />
      <div className="hidden md:flex gap-x-6">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-48 justify-between">
              {getCurrentLinkName(pathname)} <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <ul className="flex flex-col gap-y-4">
              {getLinks(pathname, !!user).map((link, index) => (
                <Link
                  key={index + link.name}
                  href={link.link}
                  className={cn(buttonVariants({ variant: "link" }), "justify-start")}>
                  {link.name}
                </Link>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        {user ? (
          <Button onClick={() => signOut({ callbackUrl: "/auth" })} variant="default">
            Sign out
          </Button>
        ) : (
          <Link href="/auth" className={buttonVariants({ variant: "default" })}>
            Sign in
          </Link>
        )}
      </div>
    </>
  );
};

export default NavControls;
