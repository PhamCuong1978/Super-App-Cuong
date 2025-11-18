
import React from 'react';

const WeatherIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M22 17a5 5 0 00-10 0" />
    <path d="M2 9a6 6 0 0110.85 3.15A5 5 0 0022 17" />
    <path d="M12 2v2" />
    <path d="M5.22 5.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M18.36 5.64l-1.42 1.42" />
    <path d="M5.22 18.78l1.42-1.42" />
  </svg>
);

export default WeatherIcon;
