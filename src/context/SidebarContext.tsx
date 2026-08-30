'use client';

import { createContext, useContext } from 'react';

interface SidebarContextType {
  isLeftBarCollapsed: boolean;
  isMenuSidebarCollapsed: boolean;
  toggleLeftBar: () => void;
  toggleMenuSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isLeftBarCollapsed: false,
  isMenuSidebarCollapsed: false,
  toggleLeftBar: () => {},
  toggleMenuSidebar: () => {},
});

export default SidebarContext;
