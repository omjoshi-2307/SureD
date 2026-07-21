import {
  LayoutDashboard, Layers, ShieldPlus, History, UserRound, Settings, LogOut,
  Building2, Inbox, ClipboardCheck,
} from 'lucide-react';
import type { NavItem } from './DashboardLayout';

/**
 * Single source of truth for sidebar/menu navigation items.
 * Previously every dashboard page re-declared this list with its own
 * hand-drawn SVG paths; icons are now standardized on lucide-react.
 */
const iconProps = { size: 17, strokeWidth: 2, 'aria-hidden': true } as const;

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard',           icon: <LayoutDashboard {...iconProps} /> },
  { id: 'deposits',  label: 'My Deposits',          icon: <Layers {...iconProps} /> },
  { id: 'escrow',    label: 'Create Escrow',        icon: <ShieldPlus {...iconProps} /> },
  { id: 'history',   label: 'Transaction History',  icon: <History {...iconProps} /> },
  { id: 'profile',   label: 'Profile',              icon: <UserRound {...iconProps} /> },
  { id: 'settings',  label: 'Settings',             icon: <Settings {...iconProps} /> },
  { id: 'logout',    label: 'Logout', isLogout: true, icon: <LogOut {...iconProps} /> },
];

export const LANDLORD_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',         icon: <LayoutDashboard {...iconProps} /> },
  { id: 'properties',   label: 'My Properties',     icon: <Building2 {...iconProps} /> },
  { id: 'incoming',     label: 'Incoming Deposits', icon: <Inbox {...iconProps} /> },
  { id: 'movein',       label: 'Confirm Move-in',   icon: <ClipboardCheck {...iconProps} /> },
  { id: 'transactions', label: 'Transactions',      icon: <History {...iconProps} /> },
  { id: 'profile',      label: 'Profile',           icon: <UserRound {...iconProps} /> },
  { id: 'settings',     label: 'Settings',          icon: <Settings {...iconProps} /> },
  { id: 'logout',       label: 'Logout', isLogout: true, icon: <LogOut {...iconProps} /> },
];
