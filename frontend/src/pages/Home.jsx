import React from 'react';

export default function Home({ userType }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome, {userType}!</h1>
    </div>
  );
}