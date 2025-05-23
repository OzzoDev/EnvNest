import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";
import dbClient from "../../../../../lib/db/models";
import { GithubUser } from "@/lib/types";

export const authOptions: NextAuthOptions = {
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return session;
    },
    async signIn({ user }) {
      try {
        await dbClient.profile.create(user as GithubUser);
      } catch (err) {
        console.error("DB error:", err);
        return false;
      }
      return true;
    },
  },
};

const hanlder = NextAuth(authOptions);

export { hanlder as GET, hanlder as POST };
