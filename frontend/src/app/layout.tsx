import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TransferLead Engine",
  description: "Lead generation tool for the ground transportation industry",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
