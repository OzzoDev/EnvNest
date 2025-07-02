const Footer = () => {
  return (
    <footer className="w-full border-t py-12 text-center text-sm text-muted-foreground">
      <p>
        © {new Date().getFullYear()} EnvNest. By developers, for developers.
      </p>
    </footer>
  );
};

export default Footer;
