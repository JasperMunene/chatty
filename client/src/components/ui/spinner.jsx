import React from 'react';

export const Spinner = () => {
  return (
    <div
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-indigo-600"
      role="status"
      aria-label="Loading"
    />
  );
};
