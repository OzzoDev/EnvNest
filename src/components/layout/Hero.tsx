import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import FadeInFromBottom from "./animations/FadeInFromBottom";
import NavLink from "./nav/NavLink";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-24 h-screen w-[90%] mx-auto">
      <FadeInFromBottom delay={0}>
        <h2 className="text-6xl xl:text-8xl font-medium text-primary text-center opacity-90">
          Welcome to EnvNest
        </h2>
      </FadeInFromBottom>

      <div className="flex flex-col items-center md:items-start gap-24">
        <FadeInFromBottom delay={0.2}>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl xl:text-4xl font-medium text-text-color text-center">
              Secure & Simple .env File Management for Teams
            </h3>
            <h4 className="text-lg xl:text-2xl text-text-color opacity-70">
              Versioned, Encrypted, GitHub-Integrated.
            </h4>
          </div>
        </FadeInFromBottom>

        <FadeInFromBottom delay={0.4}>
          <div className="flex gap-6">
            <NavLink
              href="/dashboard"
              className={buttonVariants({ size: "lg", variant: "default" })}
            >
              <span className="text-base">Go Secure</span>
            </NavLink>
            <Button size="lg" variant="secondary">
              Try CLI
            </Button>
          </div>
        </FadeInFromBottom>
      </div>
    </div>
  );
};

export default Hero;
