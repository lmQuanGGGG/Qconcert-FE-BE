import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartInitializer } from "@/components/providers/CartInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qconcert - Nền tảng đặt vé sự kiện",
  description: "Đặt vé sự kiện dễ dàng với công nghệ 3D hiện đại",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased`}>
        <CartInitializer />
        <Navbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
