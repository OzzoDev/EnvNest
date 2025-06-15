"use client";

import { ProjectWithCollaborators } from "@/types/types";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ScrollArea } from "../ui/scroll-area";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type AccessHandlerItemProps = {
  project: ProjectWithCollaborators;
};

const AccessHandlerItem = ({ project }: AccessHandlerItemProps) => {
  const [showContent, setShowContent] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-y-3 border-b border-secondary">
      <div className="flex justify-between gap-x-8">
        <p>{project.full_name}</p>
        <p>{project.collaborators?.length}</p>
        <Button onClick={() => setShowContent((prev) => !prev)} variant="ghost" size="icon">
          <motion.div
            animate={{ rotate: showContent ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}>
            <ChevronDown />
          </motion.div>
        </Button>
      </div>
      {showContent && (
        <ul className="flex flex-col gap-y-2 px-1">
          {project.collaborators?.map((collaborator) => (
            <div key={collaborator.username} className="flex gap-x-2">
              <p>{collaborator.username}</p>
              <p>{collaborator.role}</p>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AccessHandlerItem;
