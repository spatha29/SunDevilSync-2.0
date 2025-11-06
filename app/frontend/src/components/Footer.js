import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} SunDevilSync 2.0. Arizona State University.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Built with ❤️ using Polygon, IPFS, and React
        </p>
      </div>
    </footer>
  );
};

export default Footer;
