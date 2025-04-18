
import React, { useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { ThemeProvider } from "next-themes";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  // Force remove dark class to ensure light mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    document.documentElement.style.backgroundColor = "white";
    document.body.style.backgroundColor = "white";
    document.documentElement.style.color = "black";
    document.body.style.color = "black";
  }, []);
  
  return (
    <ThemeProvider defaultTheme="light" forcedTheme="light">
      <div className="flex h-full min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 md:pl-64">
          <Header title={title} />
          <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Layout;
