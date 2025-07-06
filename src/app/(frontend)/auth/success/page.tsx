"use client";

import { Button } from "@/components/ui/button";
import { copyToClipBoard } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const key = searchParams.get("key");

  useEffect(() => {
    if (!key) {
      router.push("/auth/failed");
    }
  }, [key, router]);

  return (
    <div className="flex flex-col justify-center items-center gap-y-12 h-screen w-[90%] mx-auto">
      <h2 className="text-4xl font-medium text-primary text-center">
        Authentication successful
      </h2>
      <p className="text-muted-foreground text-lg text-center">
        Paste this code into your terminal where you are running the cli
      </p>
      <h3 className="text-text-center text-2xl font-semibold text-primary">
        {key}
      </h3>
      <Button onClick={() => copyToClipBoard(key as string)} className="w-fit">
        Copy
      </Button>
    </div>
  );
};

export default page;
