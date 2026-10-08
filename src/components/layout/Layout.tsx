import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SupportButton from "./SupportButton";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar />

      <main className="min-h-screen">
        {children}
      </main>

      <SupportButton />

      <Footer />
    </>
  );
}

export default Layout;