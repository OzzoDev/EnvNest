"use client";

import { useTransition } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useNavigationStore } from "@/store/navigationStore";

interface NavLinkProps extends React.ComponentProps<typeof NextLink> {
  activeClassName?: string;
}

export default function NavLink({ href, children, ...props }: NavLinkProps) {
  const router = useRouter();
  const [_, startTransition] = useTransition();
  const startNavigation = useNavigationStore((s) => s.startNavigation);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startNavigation();

    startTransition(() => {
      router.push(href.toString());
    });
  };

  return (
    <NextLink href={href} {...props} onClick={handleClick}>
      {children}
    </NextLink>
  );
}
