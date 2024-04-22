import type { Metadata } from "next";
import "@fontsource/poppins";
import "./globals.css";
import { HeaderMenu } from "@/components/ui/header-menu";
import { Footer } from "@/components/ui/footer";
import { AuthProvider } from "./context/auth-context";


export const metadata: Metadata = {
  title: "Track&Trace Administrativo",

};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-br">
      <body >
        <AuthProvider>
          <HeaderMenu />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
