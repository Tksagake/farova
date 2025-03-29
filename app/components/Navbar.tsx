'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  BanknotesIcon,
  EnvelopeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar({ collapsed, onToggleCollapse }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile/small screens
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
    } else {
      router.push('/login');
    }
  };

  // Navigation with dynamic user profile link
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    {
      name: 'Loans',
      href: '/dashboard/loans',
      icon: UserGroupIcon,
      children: [
        { name: 'New Applications', href: '/dashboard/loans/application' },
        { name: 'My Loans', href: '/dashboard/loans' },
      ],
    },
    {
      name: 'Payments',
      href: '/dashboard/payments',
      icon: CalendarIcon,
      children: [
        { name: 'New Payment', href: '/dashboard/payments/new' },
        { name: 'Payment Tracking', href: '/dashboard/payments/history' },
      ],
    },
    {
      name: 'Me',
      href: `/dashboard/member/${user?.id || ''}`,
      icon: User,
      children: [
        {
          name: 'My Profile',
          href: `/dashboard/member/${user?.id || ''}`,
        },
        { name: 'Edit Profile', href: '/dashboard/complete-profile' },
      ],
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: ChartBarIcon,
      children: [
        { name: 'Payment Statement', href: '/dashboard/reports/statement' },
      ],
    },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-blue-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`fixed left-0 top-0 h-full bg-blue-950 shadow-sm transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-full flex-col">
        {/* Logo Section with Toggle Button */}
        <div className={`flex items-center justify-between border-b border-gray-200 px-4 bg-white ${collapsed ? 'py-4' : 'py-2'}`}>
          {!collapsed && (
            <Image
              className="h-25 w-auto"
              src="/logo.png"
              alt="Logo"
              width={160}
              height={70}
              priority
            />
          )}
          <button
            onClick={onToggleCollapse}
            className="text-blue-950 hover:text-blue-700 focus:outline-none"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={classNames(
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-950'
                          : 'text-white hover:bg-gray-50 hover:text-blue-950',
                        'group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={classNames(
                            isActive(item.href) ? 'text-blue-950' : 'text-white group-hover:text-blue-950',
                            'h-5 w-5 flex-shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {!collapsed && <span className="ml-3">{item.name}</span>}
                      </div>
                      {!collapsed && (
                        <ChevronDownIcon
                          className={classNames(
                            'h-4 w-4 transition-transform duration-200',
                            openMenus.includes(item.name) ? 'rotate-180 transform' : '',
                            isActive(item.href) ? 'text-blue-950' : 'text-white group-hover:text-blue-950'
                          )}
                        />
                      )}
                    </button>
                    {!collapsed && openMenus.includes(item.name) && (
                      <div className="mt-1 space-y-1 pl-11">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={classNames(
                              isActive(child.href)
                                ? 'bg-yellow-50 text-blue-950'
                                : 'text-white hover:bg-gray-50 hover:text-blue-950',
                              'block rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={classNames(
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-950'
                        : 'text-white hover:bg-gray-50 hover:text-blue-950',
                      'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors'
                    )}
                  >
                    <item.icon
                      className={classNames(
                        isActive(item.href) ? 'text-blue-950' : 'text-white group-hover:text-blue-950',
                        'h-5 w-5 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className={`mt-4 px-3 ${collapsed ? 'px-1' : ''}`}>
            <button
              onClick={handleLogout}
              className={`w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold py-2 px-4 rounded transition-colors ${collapsed ? 'p-2' : ''}`}
              title={collapsed ? "Logout" : ""}
            >
              {collapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              ) : (
                "Logout"
              )}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}