import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";
import { executeQuery } from "@/lib/db";

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
        await executeQuery(
          `
          INSERT INTO profile (email, name, image)
          VALUES ($1, $2, $3)
          ON CONFLICT (email) DO NOTHING  
        `,
          [user.email, user.name, user.image]
        );
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
