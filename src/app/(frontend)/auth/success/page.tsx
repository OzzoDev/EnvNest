"use client";

import { Button } from "@/components/ui/button";
import { copyToClipBoard } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const SuccessPageContent = () => {
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

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center h-screen relative w-full">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pb-20">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
};

export default Page;
