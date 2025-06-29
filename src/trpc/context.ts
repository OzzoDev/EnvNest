import { authOptions } from "@/app/(backend)/api/auth/[...nextauth]/route";
import { getDbClient } from "@/lib/db/models";
import { getServerSession } from "next-auth";
import { Session } from "next-auth";

export const createContext = async () => {
  const session = await getServerSession(authOptions);

  return { session };
};

export const createInnerTRPCContext = ({
  session,
  db,
}: {
  session: Session | null;
  db: ReturnType<typeof getDbClient>;
}) => ({
  session,
  db,
});

export type Context = Awaited<ReturnType<typeof createContext>>;
