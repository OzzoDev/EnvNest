import { cn, convertToLocalTime } from "@/lib/utils";
import { AuditLogWithUser } from "@/types/types";
import { Badge } from "../ui/badge";
import AlertDialog from "../utils/AleartDialog";
import { Button, buttonVariants } from "../ui/button";
import { GrRevert } from "react-icons/gr";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { ScrollArea } from "../ui/scroll-area";
import { useProjectStore } from "@/store/projectStore";

type AuditLogItemProps = {
  audit: AuditLogWithUser;
  onRollback: (id: number) => void;
};

const AuditLogItem = ({ audit, onRollback }: AuditLogItemProps) => {
  const { secret } = useProjectStore();
  const [showContent, setShowContent] = useState<boolean>(false);

  const [date, time] = convertToLocalTime(audit.created_at).split(" ");

  const content = audit.content.split("&&");

  const isCurrentVersion = secret?.content === audit.content;

  // console.log(secret?.content, audit.content);

  return (
    <div key={audit.created_at} className="flex flex-col gap-y-3 border-b border-secondary">
      <div className="flex justify-between">
        <Badge className="p-1 h-fit w-fit">{audit.metadata.type as string}</Badge>
        <p>
          {date} / {time}
        </p>
      </div>
      <div className="flex flex-col gap-y-2 px-1">
        <div className="flex justify-between">
          <p>{audit.user}</p>
          <AlertDialog
            title="Rollback version"
            description={`Are you sure you want to rollback the version of this .env file?`}
            action="Rollback"
            actionFn={() => onRollback(audit.id)}>
            {!isCurrentVersion && (
              <Button type="button" variant="ghost" title="Rollback">
                <GrRevert size={16} />
              </Button>
            )}
          </AlertDialog>
        </div>
        <p className="text-muted-foreground">{audit.action}</p>
        <Accordion
          type="single"
          collapsible
          onValueChange={() => setShowContent((prev) => !prev)}
          className="w-full flex flex-col p-0">
          <AccordionItem value="item-1" className="flex flex-col border-0">
            <AccordionTrigger
              className={cn(buttonVariants({ variant: "ghost" }), "ml-auto mr-auto mb-4 mt-2")}>
              {showContent ? "Hide Content" : "Show content"}
              {showContent ? <ChevronUp /> : <ChevronDown />}
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="max-h-[120px] overflow-y-auto max-w-[300px]">
                {content.map((cont, index) => (
                  <p key={cont + index} className="text-sm break-all">
                    {cont}
                  </p>
                ))}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default AuditLogItem;
