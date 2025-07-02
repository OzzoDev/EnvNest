import SlideIn from "./animations/SlideIn";

const ProblemVsSolutions = () => {
  const painPoints = [
    "Messy sharing of .env files via insecure channels (Slack, email, zip).",
    "No version history to track changes or roll back.",
    "Sensitive credentials are often exposed unintentionally.",
    "Manual updates cause errors and slow collaboration.",
  ];

  const solutions = [
    "Secure sharing with GitHub OAuth login and encrypted storage.",
    "Full version control and audit logs for all changes.",
    "End-to-end AES-256 encryption ensures secrets stay safe.",
    "Team/organization-based access control with easy role management.",
  ];

  return (
    <section className="max-w-7xl mx-auto px-8 py-20 mt-32">
      <h2 className="text-4xl font-semibold text-center mb-16 text-text-color">
        Why EnvNest?
      </h2>
      <div className="flex flex-col md:flex-row gap-12 md:gap-20">
        <div className="md:w-1/2 space-y-6">
          <SlideIn delay={0.2} direction="bottom">
            <h3 className="text-2xl font-medium mb-4 text-primary">
              Common Problems
            </h3>
            <ul className="text-lg text-text-color">
              {painPoints.map((issue, index) => (
                <li key={index}>❌ {issue}</li>
              ))}
            </ul>
          </SlideIn>
        </div>

        <div className="md:w-1/2 space-y-6">
          <SlideIn delay={0.4} direction="bottom">
            <h3 className="text-2xl font-medium mb-4 text-primary">
              How EnvNest Solves Them
            </h3>
            <ul className="text-lg text-text-color">
              {solutions.map((solution, index) => (
                <li key={index}>✅ {solution}</li>
              ))}
            </ul>
          </SlideIn>
        </div>
      </div>
    </section>
  );
};

export default ProblemVsSolutions;
