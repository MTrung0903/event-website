import React, { useState, useEffect } from "react";
const BackIcon = ({ onClick }) => (
  <span
    onClick={onClick}
    className="cursor-pointer mr-2 hover:scale-110 transition-transform duration-200"
    aria-label="Go back"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 inline"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </span>
);
export default BackIcon