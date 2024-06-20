import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interface",
  description: "Technical Interview Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="./interface.png"
          type="image/png"
          sizes="256x256"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
