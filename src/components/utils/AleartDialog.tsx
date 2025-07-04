import { ButtonHTMLAttributes, cloneElement, ReactElement } from "react";
import {
  AlertDialog as AlertDialogRoot,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AlertDialogProps = {
  title: string;
  description: string;
  action: string;
  actionFn: () => void;
  unsafe?: boolean;
  children: ReactElement<ButtonHTMLAttributes<HTMLButtonElement>> | false;
};

const AlertDialog = ({
  title,
  description,
  action,
  actionFn,
  unsafe = false,
  children,
}: AlertDialogProps) => {
  if (unsafe && children) {
    return <>{cloneElement(children, { onClick: actionFn })}</>;
  }

  return (
    <AlertDialogRoot>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => actionFn()}>
            {action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
};

export default AlertDialog;
