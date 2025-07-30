import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/navBar/navBar";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: "Home Showcase",
  description: "Home Showcase",
};

const navLinks = [
  { name: "Accueil", href: "/" },
  { name: "Venir au gîte", href: "/visit" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-theme="pastel">
      <body>
        <NavBar navLinks={navLinks} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
