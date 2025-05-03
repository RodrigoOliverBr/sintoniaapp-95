
import React from 'react';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const SimpleLayout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <div>{children}</div>
    </div>
  );
};

export default SimpleLayout;
