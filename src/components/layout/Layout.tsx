import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

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

      <Footer />
    </>
  );
}

export default Layout;