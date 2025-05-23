"use client";

import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

const AuthPageContent = () => {
  const { data: session } = useSession();

  return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6">Welcome to EnvVault</h1>
      {session ? (
        <div>
          <p>Hello, {session.user?.name} 👋</p>
          <button onClick={() => signOut()} className="mt-4 bg-black text-white px-4 py-2 rounded">
            Log out
          </button>
        </div>
      ) : (
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="mt-4 bg-black text-white px-4 py-2 rounded">
          Sign in with Github
        </button>
      )}
    </div>
  );
};

const AuthPage = () => {
  return (
    <SessionProvider>
      <AuthPageContent />
    </SessionProvider>
  );
};

export default AuthPage;
