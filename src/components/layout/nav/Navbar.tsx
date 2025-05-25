import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import MaxWidthWrapper from "@/components/utils/MaxWidthWrapper";
import { getServerSession } from "next-auth";
import NavControls from "./NavControls";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const NavBar = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="bg-background sticky z-50 top-0 inset-x-0 h-16">
      <header className="relative bg-background">
        <MaxWidthWrapper>
          <div className="border-b border-muted">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <h1 className="text-2xl font-semibold text-text-color tracking-wide">
                  Env<span className="text-primary tracking-wide">Vault</span>
                </h1>
              </Link>

              {user && (
                <div>
                  <Link href="/dashboard" className={buttonVariants({ variant: "secondary" })}>
                    Dashboard
                  </Link>
                </div>
              )}

              <div className="flex items-center">
                <NavControls user={user} />
              </div>
            </div>
          </div>
        </MaxWidthWrapper>
      </header>
    </div>
  );
};

export default NavBar;
