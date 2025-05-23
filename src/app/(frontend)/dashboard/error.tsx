"use client";

import { signOut } from "next-auth/react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.log(error);

  return (
    <div className="text-red-600 p-4">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset} className="mt-2 bg-red-500 text-white px-4 py-1 rounded">
        Try again
      </button>
      <button onClick={() => signOut({ callbackUrl: "/auth" })}>Log out</button>
    </div>
  );
}
