import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata = {
  title: "SafeBuddy — Secure Password Manager",
  description: "Store and manage your passwords securely with AES-256 encryption",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} scroll-smooth`}>
      <body className="min-h-screen text-slate-100 font-sans" style={{ background: "#0a0a0f" }}>
        {children}
      </body>
    </html>
  );
}
