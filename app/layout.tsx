import type { Metadata } from "next";
import Scene from "./components/Scene";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spot the AI",
  description:
    "A live classroom workshop for spotting synthetic posts, then playing three team rounds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Scene />
        {children}
      </body>
    </html>
  );
}
