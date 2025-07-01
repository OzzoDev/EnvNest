"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { SessionProvider, signIn } from "next-auth/react";

const AuthPageContent = () => {
  return (
    <div className="flex flex-col items-center mt-32 max-w-[90%] mx-auto">
      <div className="flex flex-col items-center gap-8 lg:gap-24">
        <h1 className="text-5xl text-center font-bold mb-6">
          Welcome to <span className="text-primary">EnvNest</span>
        </h1>
        <Card className="bg-background border-0 w-[90%] max-w-[900px] flex flex-col gap-8 lg:gap-12">
          <CardHeader className="text-center text-xl font-medium text-muted-foreground">
            Take control of your environment files — effortlessly.
          </CardHeader>
          <CardDescription className="self-center text-center w-[60%]">
            Connect your GitHub and securely manage your project secrets in one
            place. Streamline collaboration and protect your `.env` files with
            confidence.
          </CardDescription>
          <CardContent></CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              size="lg"
            >
              Sign in with GitHub
            </Button>
          </CardFooter>
        </Card>
      </div>
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
