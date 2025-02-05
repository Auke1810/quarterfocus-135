import React from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from '../Menu';
import { Header } from '../Header';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="fixed top-4 left-4 z-40">
        <Menu />
      </div>
      <main className="p-4 mt-16">
        <Outlet />
      </main>
    </div>
  );
};
