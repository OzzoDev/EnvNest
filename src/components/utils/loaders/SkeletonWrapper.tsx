import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

type SkeletonWrapperProps = {
  skeletons: number;
  width?: string;
  height?: string;
  isLoading: boolean;
  className?: string;
  children: ReactNode;
};

const SkeletonWrapper = ({
  skeletons,
  width = "w-full",
  height = "h-10",
  isLoading,
  className,
  children,
}: SkeletonWrapperProps) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <ul className={className}>
      {Array.from({ length: skeletons }).map(() => (
        <Skeleton key={uuidv4()} className={cn(width, height)} />
      ))}
    </ul>
  );
};

export default SkeletonWrapper;
