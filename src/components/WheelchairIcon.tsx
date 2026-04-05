import React from 'react';

export const WheelchairIcon = ({ className = "w-6 h-6", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="4" r="1" />
    <path d="M18 19l-2 1v-3.5c0-1.1-.9-2-2-2h-5c-1.1 0-2 .9-2 2V21l-2-1" />
    <path d="M7 13.4c1.9 1.8 4.4 2.6 7 2.6 2.6 0 5.1-.8 7-2.6" />
    <path d="M7 13.4C5.1 11.6 4 9 4 6" />
  </svg>
);
