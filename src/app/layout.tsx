import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

import { StoreProvider } from "./context/StoreContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "現炒店點餐系統",
  description: "掃碼點餐，美味即享",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <StoreProvider>
          <AuthProvider>{children}</AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
