import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";

console.log("Client id: ", process.env.GITHUB_CLIENT_ID);
console.log("Client secret: ", process.env.GITHUB_CLIENT_SECRET);

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
  },
};

const hanlder = NextAuth(authOptions);

export { hanlder as GET, hanlder as POST };
