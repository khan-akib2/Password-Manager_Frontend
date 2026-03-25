import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata = {
  title: "PassVault",
  description: "Secure password manager",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-gray-950 text-gray-100 font-sans">
        {children}
      </body>
    </html>
  );
}
