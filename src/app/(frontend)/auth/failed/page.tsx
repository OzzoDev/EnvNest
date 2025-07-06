import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

const Page = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-y-12 h-screen w-[90%] mx-auto">
      <h2 className="text-4xl font-medium text-primary text-center">
        Authentication failed
      </h2>
      <Link href="/" className={buttonVariants({ variant: "default" })}>
        Home
      </Link>
    </div>
  );
};

export default Page;
