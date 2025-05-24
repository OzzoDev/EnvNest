import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export const createContext = async ({ req }: { req: Request }) => {
  const session = await getServerSession(authOptions);

  return { session };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
