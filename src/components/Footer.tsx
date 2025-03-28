
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto p-4 text-center text-xs text-analytics-gray">
      <p>This extension analyzes the current page to detect GTM, GA4, Adobe, Amplitude and Clarity scripts.</p>
      <p className="mt-2 font-medium">Developed by Pablo Moratinos at Product Hackers</p>
    </footer>
  );
};

export default Footer;
