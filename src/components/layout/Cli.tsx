import { copyToClipBoard } from "@/lib/utils";
import { Button } from "../ui/button";
import SlideIn from "./animations/SlideIn";

const COMMANDS = [
  {
    command: "npm install envnest",
    description:
      "Install the EnvNest CLI globally to start managing your .env files from the terminal.",
  },
  {
    command: "envnest",
    description:
      "Login and start securely syncing your secrets locally with one command.",
  },
  {
    command: "envnest logout",
    description: "Logout from EnvNest CLI and clear local authentication.",
  },
];

const Cli = () => {
  return (
    <section className="max-w-5xl mx-auto px-8 py-32" id="cli">
      <h2 className="text-4xl font-semibold text-center text-text-color mb-10">
        Instant .env Access via CLI
      </h2>
      <p className="text-center max-w-xl mx-auto mb-12 text-lg text-muted-foreground">
        The EnvNest CLI lets you securely login and sync your secrets locally
        with a simple, unified command.
      </p>

      <div className="space-y-8 max-w-3xl mx-auto">
        {COMMANDS.map(({ command, description }, index) => (
          <SlideIn key={index} delay={0.2 + index * 0.2} direction="bottom">
            <div className="rounded-lg p-6 flex flex-col gap-y-4 items-start">
              <div className="flex justify-between w-full">
                <code className="text-xl text-primary">{command}</code>
                <Button
                  variant="outline"
                  onClick={() => copyToClipBoard(command)}
                  aria-label={`Copy ${command} to clipboard`}
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm max-w-xs">{description}</p>
            </div>
          </SlideIn>
        ))}
      </div>
    </section>
  );
};

export default Cli;
