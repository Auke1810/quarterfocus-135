import React from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from '../Menu';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 p-4 z-30">
        <Menu />
      </div>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
};
