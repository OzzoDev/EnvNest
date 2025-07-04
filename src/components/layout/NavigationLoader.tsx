"use client";

import { useNavigationStore } from "@/store/navigationStore";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect } from "react";

const NavigationLoader = ({ children }: { children: ReactNode }) => {
  const isNavigating = useNavigationStore((state) => state.isNavigating);
  const finishNavigation = useNavigationStore((s) => s.finishNavigation);

  const pathname = usePathname();

  useEffect(() => {
    finishNavigation();
  }, [pathname]);

  console.log("is navi: ", isNavigating);

  if (isNavigating) {
    if (isNavigating) {
      return (
        <div className="flex flex-col items-center justify-center h-screen relative w-full">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pb-20">
            <Loader2 className="animate-spin h-12 w-12 text-primary" />
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default NavigationLoader;
