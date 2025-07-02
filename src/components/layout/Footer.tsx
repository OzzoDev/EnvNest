import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

const Footer = () => {
  return (
    <footer className="w-full border-t py-12 text-center text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center mx-auto w-fit">
        <p>
          © {new Date().getFullYear()}&nbsp;
          <Link
            className={cn(buttonVariants({ variant: "link" }), "px-0 text-sm")}
            href="https://github.com/OzzoDev/EnvNest"
          >
            EnvNest.
          </Link>
          &nbsp;By developers, for developers.
        </p>
      </div>
      <div>
        Created by&nbsp;
        <Link
          className={cn(buttonVariants({ variant: "link" }), "px-0 text-sm")}
          href="https://github.com/OzzoDev"
        >
          OzzoDev
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
