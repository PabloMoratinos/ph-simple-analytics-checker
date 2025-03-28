
import React from 'react';
import { Rocket } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-analytics-blue text-white p-4 shadow-md">
      <div className="flex items-center gap-2">
        <Rocket className="h-6 w-6 text-white" />
        <h1 className="text-xl font-bold">PH Simple Analytics Checker</h1>
      </div>
      <p className="text-sm opacity-80">Verifique los scripts de analítica en cualquier página web</p>
    </header>
  );
};

export default Header;
