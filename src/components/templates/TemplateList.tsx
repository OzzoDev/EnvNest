"use client";

import { trpc } from "@/trpc/client";

const TemplateList = () => {
  const {
    data: templates,
    error,
    isLoading,
  } = trpc.template.getOwnAndPublic.useQuery(undefined, { retry: false });

  console.log("Templates: ", templates);

  return null;
};

export default TemplateList;
