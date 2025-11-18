
import React from 'react';

const BankIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 21 18 0" />
    <path d="M5 21V10l7-5 7 5v11" />
    <path d="M9 21V15" />
    <path d="M15 21V15" />
    <path d="M12 21V10" />
  </svg>
);

export default BankIcon;
