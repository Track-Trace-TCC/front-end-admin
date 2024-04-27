import type { Metadata } from "next";
import "@fontsource/poppins";
import 'react-toastify/dist/ReactToastify.css';
import "./globals.css";
import { HeaderMenu } from "@/components/ui/header-menu";
import { Footer } from "@/components/ui/footer";
import { AuthProvider } from "./context/auth-context";
import { ToastContainer } from 'react-toastify';

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
          <main className="flex-grow pb-16">
            {children}
          </main>
          <ToastContainer />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
