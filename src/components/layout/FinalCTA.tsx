import { Button, buttonVariants } from "../ui/button";
import NavLink from "./nav/NavLink";

const FinalCTA = () => {
  return (
    <section className="flex flex-col items-center gap-y-12 py-32 px-8 text-center border-t mb-12">
      <h2 className="text-3xl md:text-4xl font-semibold text-primary mb-4">
        Take control of your environment files
      </h2>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
        Stop sharing secrets over Slack and email. Never lose access again — go
        secure with EnvNest today.
      </p>
      <NavLink
        href="/dashboard"
        className={buttonVariants({ size: "lg", variant: "default" })}
      >
        <span className="text-base">Go Secure</span>
      </NavLink>
    </section>
  );
};

export default FinalCTA;
