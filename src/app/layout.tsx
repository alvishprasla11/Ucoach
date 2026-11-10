import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";

const brand = Roboto_Slab({
  variable: "--font-brand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UCoach — UCalgary Dinos Volunteer Coaching",
  description:
    "Connecting UCalgary Dinos varsity athletes with Calgary schools as volunteer coaches for youth basketball and football teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${brand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
