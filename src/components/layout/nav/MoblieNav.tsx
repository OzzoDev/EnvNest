import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NextAuthUser } from "@/types/types";
import { FiMenu } from "react-icons/fi";
import Link from "next/link";
import { cn, getLinks } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";

type MobliNavProps = {
  user: NextAuthUser | undefined;
};

const MoblieNav = ({ user }: MobliNavProps) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost">
          <FiMenu size={32} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-48 pt-14 flex flex-col gap-y-8">
        <SheetHeader>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <DialogDescription className="sr-only">
            Dialog description for screen readers
          </DialogDescription>
        </SheetHeader>
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
        {user ? (
          <Button
            onClick={() => signOut({ callbackUrl: "/auth" })}
            variant="default"
            className="w-full">
            Sign out
          </Button>
        ) : (
          <Link href="/auth" className={buttonVariants({ variant: "default" })}>
            Sign in
          </Link>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MoblieNav;
