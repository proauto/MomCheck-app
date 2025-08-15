import React, { type ReactNode } from 'react';

interface PageProps {
  title?: string;
  children: ReactNode;
}

export const Page: React.FC<PageProps> = ({ title, children }) => {
  return (
    <main 
      className="bg-bg-page"
      role="main"
    >
      <div className="mx-auto">
        {title && (
          <h1 className="sr-only">{title}</h1>
        )}
        {children}
      </div>
    </main>
  );
};