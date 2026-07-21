// Shared TypeScript types for WattWise AI

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
}
