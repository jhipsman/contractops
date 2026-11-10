import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
const openSans = localFont({
  src: [
    { path: "../public/fonts/OpenSans-Regular.ttf", weight: "400" },
    { path: "../public/fonts/OpenSans-Semibold.ttf", weight: "600" },
    { path: "../public/fonts/OpenSans-Bold.ttf", weight: "700" },
  ],
  variable: "--font-interface",
  display: "swap",
});
export const metadata: Metadata = {
  title: "ContractOps — Your contracts, coordinated",
  description: "Government contract operations for human-services nonprofits.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={openSans.variable}>{children}</body>
    </html>
  );
}
