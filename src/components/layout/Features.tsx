import SlideIn from "./animations/SlideIn";
import Feature from "./Feature";

const FEAUREITEMS = [
  {
    headline: "GitHub-Integrated Projects",
    text: "Login, find repos, and manage .env files by folder or subfolder — all through seamless GitHub integration.",
  },
  {
    headline: "Unlimited Projects & Files",
    text: "Create as many projects as you want. Each project supports multiple .env files — even deep folder structures.",
  },
  {
    headline: "Fine-Grained Access Control",
    text: "Set roles per project: editor or viewer. Use organizations or manually add collaborators — revoke access instantly when needed.",
  },
  {
    headline: "End-to-End AES-256 Encryption",
    text: "Every .env file is encrypted with a unique key. Only authorized users with project access can decrypt or modify.",
  },
  {
    headline: "Version History & Rollbacks",
    text: "Track every change with author and timestamp. Roll back to previous versions instantly — with full team visibility.",
  },
  {
    headline: "Secure Access from Anywhere",
    text: "Access your encrypted .env files from any device — confidently and securely, wherever your team works.",
  },
];

const Features = () => {
  return (
    <section className="flex flex-col items-center p-8">
      <h2 className="text-4xl font-semibold text-center mb-16 text-text-color">
        Powerful Features to Simplify .env Management
      </h2>
      <ul className="flex md:grid md:grid-cols-[repeat(2,1fr)] md:grid-rows-[repeat(3,1fr)] xl:grid-cols-[repeat(3,1fr)] xl:grid-rows-[repeat(2,1fr)] flex-col items-center justify-center gap-8">
        {FEAUREITEMS.map((item, index) => (
          <SlideIn
            key={item.headline}
            direction={index % 2 === 0 ? "left" : "right"}
            delay={0.1 + index * 0.1}
          >
            <Feature headline={item.headline} text={item.text} />
          </SlideIn>
        ))}
      </ul>
    </section>
  );
};

export default Features;
