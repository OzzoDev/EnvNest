"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { NextAuthUser } from "@/types/types";
import { signOut } from "next-auth/react";
import Link from "next/link";

type NavbarControlsProps = {
  user: NextAuthUser | undefined;
};

const NavControls = ({ user }: NavbarControlsProps) => {
  return (
    <>
      {user ? (
        <Button onClick={() => signOut({ callbackUrl: "/auth" })} variant="ghost">
          Sign out
        </Button>
      ) : (
        <Link href="/auth" className={buttonVariants({ variant: "default" })}>
          Sign in
        </Link>
      )}
    </>
  );
};

export default NavControls;
