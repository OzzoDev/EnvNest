import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";
import { GithubUser } from "../../../../../types/types";
import { getDbClient } from "@/lib/db/models";

export const authOptions: NextAuthOptions = {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:org repo user:email",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
    async signIn({ user }) {
      try {
        const githubUser: GithubUser = {
          github_id: user.id,
          name: user.name!,
          email: user.email || undefined,
          image: user.image || undefined,
        };

        const { github_id, ...rest } = githubUser;

        const db = await getDbClient();

        await db.profile.upsert({ github_id }, rest, githubUser);
      } catch (err) {
        throw new Error("Database error on sign-in");
      }
      return true;
    },
  },
};

const hanlder = NextAuth(authOptions);

export { hanlder as GET, hanlder as POST };
