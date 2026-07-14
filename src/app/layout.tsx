import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { Shell } from "@/components/shell";
import { getCurrentUser } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/admin";
import { logoutAction } from "@/app/actions/auth";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "China MOS — China Market Operating System",
  description: "AI 驱动的企业级中国市场进入与战略咨询操作系统",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const account = user ? { name: user.name, email: user.email, isAdmin: isPlatformAdmin(user) } : null;
  return (
    <html lang="zh" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ThemeProvider>
          <LangProvider>
            <Shell account={account} logout={logoutAction}>{children}</Shell>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
