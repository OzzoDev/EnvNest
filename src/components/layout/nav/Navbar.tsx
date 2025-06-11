import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import NavControls from "./NavControls";

const NavBar = async () => {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="bg-background sticky z-50 top-0 inset-x-0">
      <header className="relative bg-background">
        <div className="border-b border-muted p-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-semibold text-text-color tracking-wide">
                Env<span className="text-primary tracking-wide">Vault</span>
              </h1>
            </Link>

            <NavControls user={user} />
          </div>
        </div>
      </header>
    </div>
  );
};

export default NavBar;
