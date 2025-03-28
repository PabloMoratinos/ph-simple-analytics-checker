
import React from 'react';
import { Rocket } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-analytics-blue text-white p-4 shadow-md">
      <div className="flex items-center gap-2">
        <Rocket className="h-5 w-5" />
        <h1 className="text-xl font-bold">PH-Analytics-Checker</h1>
      </div>
      <p className="text-sm opacity-80">Verifique los scripts de analítica en cualquier página web</p>
    </header>
  );
};

export default Header;
