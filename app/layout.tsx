import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noren Focus",
  description: "A calm focus timer and three-priority daily planner.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
