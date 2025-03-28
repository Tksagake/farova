'use client';

import { useState } from 'react';
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
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  {
    name: 'Loan Management',
    href: '/admin/loans',
    icon: UserGroupIcon,
    children: [
      { name: 'Applications', href: '/admin/loans/applications' },
      { name: 'Loans', href: '/admin/loans' },
    ],
  },
  {
    name: 'Payments',
    href: '/admin/payments',
    icon: CalendarIcon,
    children: [
      { name: 'Payment Tracking', href: '/admin/payments' },
      { name: 'New Payment', href: '/admin/payments/new' },
      { name: 'Payment History', href: '/admin/payments/history' },
    ],
  },
  {
    name: 'Members',
    href: '/admin/members',
    icon: BanknotesIcon,
    children: [
      { name: 'All Members', href: '/admin/members' },
      { name: 'Review Membership', href: '/admin/members/review' },
    ],
  },
  {
    name: 'Communications',
    href: '/admin/communications',
    icon: EnvelopeIcon,
    children: [
      { name: 'Messages', href: '/admin/communications' },
      { name: 'New Message', href: '/admin/communications/new' },
    ],
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: ChartBarIcon,
    children: [
      { name: 'Member Reports', href: '/admin/reports/memebrs' },
      { name: 'Financial Reports', href: '/admin/reports/finance' },
    ],
  },
 // { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for mobile sidebar

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
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

  return (
    <>
      {/* Mobile Navbar Toggle */}
      <div className="lg:hidden flex items-center justify-between bg-blue-950 text-white px-4 py-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white focus:outline-none"
        >
          {sidebarOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
        <Image
          className="h-8 w-auto"
          src="/logo.png"
          alt="Logo"
          width={120}
          height={40}
          priority
        />
      </div>

      {/* Sidebar */}
      <div
        className={classNames(
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'fixed left-0 top-0 h-full w-64 bg-blue-950 text-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none'
        )}
      >
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
                              isActive(item.href)
                                ? 'text-blue-950'
                                : 'text-white group-hover:text-blue-950',
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
                            isActive(item.href)
                              ? 'text-blue-950'
                              : 'text-white group-hover:text-blue-950'
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
                          isActive(item.href)
                            ? 'text-blue-950'
                            : 'text-gray-500 group-hover:text-blue-950',
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
            <button
              onClick={handleLogout}
              className="bg-yellow-500 hover:bg-white-600 text-white font-bold py-2 px-4 rounded mb-4"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}