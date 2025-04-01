
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-header text-white p-4 shadow-md">
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          <img 
            src="/lovable-uploads/34c73b7b-1939-48c4-b2eb-f0cd48e3d1ae.png" 
            alt="Product Hackers Logo" 
            className="h-6 w-auto object-contain" 
          />
        </div>
        <h1 className="text-xl font-bold">PH Simple Analytics Checker</h1>
      </div>
      <p className="text-sm opacity-80">Check analytics scripts on any web page</p>
    </header>
  );
};

export default Header;
