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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null); // Store user info

  // Fetch user info on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        router.push('/login'); // Redirect if not authenticated
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
        { name: 'Payment Tracking', href: '/dashboard/payments/tracking' },
        { name: 'New Payment', href: '/dashboard/payments/new' },
        { name: 'Payment History', href: '/dashboard/payments/history' },
      ],
    },
    {
      name: 'Me',
      href: `/dashboard/member/${user?.id || ''}`, // Dynamic link
      icon: User,
      children: [
        {
          name: 'My Profile',
          href: `/dashboard/member/${user?.id || ''}`, // Dynamic link
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
       // { name: '', href: '/dashboard/reports/finance' },
      ],
    },
    //{ name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 border-r border-gray-200 bg-blue-950 shadow-sm">
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4 bg-white">
          <Image
            className="h-25 w-auto"
            src="/logo.png"
            alt="Logo"
            width={160}
            height={70}
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
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
                            'mr-3 h-5 w-5 flex-shrink-0'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                      <ChevronDownIcon
                        className={classNames(
                          'h-4 w-4 transition-transform duration-200',
                          openMenus.includes(item.name) ? 'rotate-180 transform' : '',
                          isActive(item.href) ? 'text-blue-950' : 'text-white group-hover:text-blue-950'
                        )}
                      />
                    </button>
                    {openMenus.includes(item.name) && (
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
                        'mr-3 h-5 w-5 flex-shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 px-3">
            <button
              onClick={handleLogout}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-950 font-bold py-2 px-4 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
