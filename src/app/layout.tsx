import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/layout/nav/Navbar";
import { Toaster } from "sonner";
import Providers from "@/components/providers/Providers";
import NavigationLoader from "@/components/layout/NavigationLoader";
import Footer from "@/components/layout/Footer";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EnvNest — Secure GitHub-powered .env Manager",
  description:
    "EnvNest helps teams securely manage, encrypt, version, and sync .env files with GitHub login and end-to-end encryption.",
  metadataBase: new URL("https://envnest.com"),
  openGraph: {
    title: "EnvNest — Secure GitHub-powered .env Manager",
    description:
      "Securely manage, encrypt, and sync your .env files with GitHub login and full version history.",
    url: "https://envnest.com",
    siteName: "EnvNest",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "EnvNest App Screenshot",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EnvNest — Secure GitHub-powered .env Manager",
    description:
      "Securely manage, encrypt, and sync your .env files with GitHub login and full version history.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} dark bg-background`}
      >
        <Providers>
          <NavBar />
          <NavigationLoader>
            <>{children}</>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: "#333",
                  color: "#fff",
                },
                duration: 5000,
              }}
              richColors
            />
          </NavigationLoader>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
