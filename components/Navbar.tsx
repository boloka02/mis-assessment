'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import LoginModal from "./LoginModal";
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  role: string;
}

const categories = [
  { id: 'english', name: 'English Grammar' },
  { id: 'logical', name: 'Logical Reasoning' },
  { id: 'computerskill', name: 'Computer Skills' },
  { id: 'customerservice', name: 'Customer Service' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const avatarRef = useRef<HTMLDivElement>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) setUser(data.user);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setAvatarDropdownOpen(false);
    router.push('/');
  };

  const currentCategory =
    categories.find((c) => pathname.startsWith(`/exam/${c.id}`))?.name ||
    'Select Exam';

  // ✅ Safe version — handles undefined or empty names
  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return '?';
    const parts = name.trim().split(/\s+/);
    return parts
      .map((n) => n.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200 dark:bg-black/80 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg" />
            <span className="text-lg">Adon</span>
          </Link>

          {/* Right: Category Dropdown + Avatar */}
          <div className="flex items-center gap-3">
            {/* Category Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                >
                  <span className="max-w-28 truncate">{currentCategory}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/exam/${cat.id}`}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Avatar / Login */}
            {user ? (
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shadow-md hover:shadow-lg transition-shadow"
                >
                  {getInitials(user?.name)}
                </button>

                {avatarDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-1.5 text-sm font-medium border border-zinc-300 dark:border-zinc-700 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onLogin={(u) => setUser(u)}
      />
    </>
  );
}
