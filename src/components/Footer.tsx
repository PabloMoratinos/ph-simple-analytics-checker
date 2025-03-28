
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto p-4 text-center text-xs text-analytics-gray">
      <p>This extension analyzes the source code of the current page to detect GTM, GA4, Adobe, and Amplitude scripts.</p>
    </footer>
  );
};

export default Footer;
