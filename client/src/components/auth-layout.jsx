import React from 'react';
import { MessageSquare } from 'lucide-react';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-xl ring-1 ring-gray-200">
        <div className="text-center">
          <div className="flex justify-center">
            <MessageSquare className="h-14 w-14 text-indigo-600 animate-bounce" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
