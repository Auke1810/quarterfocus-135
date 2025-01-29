import React, { useState } from "react";
import menuIcon from "@/assets/menu.svg";
import menuFocusIcon from "@/assets/menu-focus.svg";
import qfLogo from "@/assets/qflogo.svg";
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface MenuItemProps {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  separator?: boolean;
  onClick?: () => void;
}

const MenuItem = ({ to, icon, children, separator, onClick }: MenuItemProps) => {
  return (
    <>
      <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            'w-full text-left flex items-center gap-2 px-4 py-2 text-sm rounded-lg hover:bg-accent transition-colors',
            isActive && 'bg-accent'
          )
        }
      >
        {icon}
        <span>{children}</span>
      </NavLink>
      {separator && <div className="h-px bg-border mx-4 my-2" />}
    </>
  );
};

export function Menu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Menu Toggle Button */}
      <button
        className="flex items-center"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={isHovered ? menuFocusIcon : menuIcon}
          alt="Menu"
          className="h-6 w-6"
        />
      </button>

      {/* Slide-out Menu */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-background border-r transform transition-transform duration-300 ease-in-out z-20',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Menu Header */}
        <div className="px-4 py-2 border-b flex items-center gap-2">
          <img src={qfLogo} alt="Quarter Focus Logo" className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Quarter Focus</h2>
        </div>

        {/* Menu Content */}
        <nav className="p-4 space-y-2">
          <MenuItem 
            to="/" 
            icon={<Star className="w-4 h-4" />} 
            separator 
            onClick={() => setIsOpen(false)}
          >
            Focus
          </MenuItem>
          <MenuItem 
            to="/tomorrow"
            onClick={() => setIsOpen(false)}
          >
            Tomorrow
          </MenuItem>
          <MenuItem 
            to="/week"
            onClick={() => setIsOpen(false)}
          >
            This Week
          </MenuItem>
          <Separator className="my-4" />
          <MenuItem 
            to="/quarter-goals"
            onClick={() => setIsOpen(false)}
          >
            Quarter Goals
          </MenuItem>
          <MenuItem 
            to="/vision"
            onClick={() => setIsOpen(false)}
          >
            Vision & long-term goals
          </MenuItem>
          <Separator className="my-4" />
          <MenuItem 
            to="/review"
            onClick={() => setIsOpen(false)}
          >
            Review
          </MenuItem>
        </nav>
      </div>

      {/* Overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
