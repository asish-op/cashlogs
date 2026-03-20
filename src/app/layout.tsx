import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cash Transaction Log",
  description: "Track cash transactions with pass codes, counts, and totals."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}