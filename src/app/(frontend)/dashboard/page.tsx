"use client";

import EnvCreator from "@/components/editor/EnvCreator";
import EnvEditor from "@/components/editor/EnvEditor";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/projectStore";
import { MdErrorOutline } from "react-icons/md";

const DashboardPage = () => {
  const error = useProjectStore((state) => state.error);

  if (error) {
    return (
      <div className="pt-44 flex flex-col gap-y-16 items-center">
        <MdErrorOutline size={48} className="text-destructive" />
        <p className="text-center text-2xl text-destructive font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </div>
    );
  }

  return (
    <>
      <EnvCreator />
      <EnvEditor />
    </>
  );
};

export default DashboardPage;
