import { Skeleton } from "@/components/ui/skeleton";
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
  width = "full",
  height = "10",
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
        <Skeleton key={uuidv4()} className={`w-${width} h-${height}`} />
      ))}
    </ul>
  );
};

export default SkeletonWrapper;
