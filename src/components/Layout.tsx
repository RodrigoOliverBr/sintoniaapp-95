
import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 md:pl-64">
        <Header title={title} />
        <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
