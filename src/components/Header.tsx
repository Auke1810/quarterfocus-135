import React from 'react';
import { Menu } from './Menu';
import { LoginButton } from './auth/LoginButton';

export function Header() {
  return (
    <header className="flex justify-between items-center px-4 py-2 border-b shrink-0 header-white">
      <div className="flex items-center">
        <Menu />
      </div>
      
      <div className="flex items-center space-x-4">
        <LoginButton />
      </div>
    </header>
  );
}
