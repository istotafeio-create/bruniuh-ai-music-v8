import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "BRUNIUHMUSIC AI MUSIC",
  description: "Create complete AI-powered songs with BRUNIUHMUSIC AI MUSIC."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
