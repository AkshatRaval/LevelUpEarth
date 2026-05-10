"use client";

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  PlusSquare,
  Trophy,
  User,
  LogOut,
  Rss,
  Shield,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
         // Basic admin check logic based on metadata or specific email
         if (user.user_metadata?.role === 'admin' || user.email === 'admin@levelupearth.com') {
            setIsAdmin(true);
         }
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = [
    { name: 'Home', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Feed', icon: <Rss size={20} />, path: '/feed' },
    { name: 'Log Action', icon: <PlusSquare size={20} />, path: '/add-action' },
    { name: 'Leaderboard', icon: <Trophy size={20} />, path: '/leaderboard' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF5] text-black font-bold">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="fixed left-0 top-0 hidden h-full w-56 border-r-4 border-black bg-white lg:flex flex-col z-50">
        <div className="p-5 border-b-4 border-black bg-emerald-500">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Level Up Earth</h2>
        </div>

        <nav className="flex-1 space-y-1 p-3 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`flex w-full items-center gap-3 border-2 px-3 py-2 text-xs font-black uppercase tracking-tight transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                  isActive 
                    ? 'border-black bg-emerald-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                    : 'border-transparent hover:border-black hover:bg-emerald-50 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
          
          {/* Admin Link (Only visible to verified admins) */}
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className={`flex w-full items-center gap-3 border-2 px-3 py-2 text-xs font-black uppercase tracking-tight transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                pathname === '/admin'
                  ? 'border-black bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                  : 'border-transparent hover:border-black hover:bg-yellow-300 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <Shield size={20} />
              Admin
            </button>
          )}
        </nav>

        <div className="p-3 border-t-4 border-black">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 text-xs font-black uppercase hover:text-red-600 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <main className="lg:ml-56 pb-24 lg:pb-8">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b-4 border-black bg-white p-4 lg:hidden sticky top-0 z-40">
          <h2 className="text-xl font-black uppercase italic tracking-tighter">Level Up Earth</h2>
          <div className="border-2 border-black bg-orange-400 p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer" onClick={() => router.push('/profile')}>
            <User size={20} />
          </div>
        </div>

        {children}
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full border-t-4 border-black bg-white lg:hidden">
        {navItems.map((item) => {
           const isActive = pathname === item.path;
           return (
             <button
               key={item.name}
               onClick={() => router.push(item.path)}
               className={`flex flex-1 flex-col items-center justify-center py-3 transition-colors border-r-2 last:border-r-0 border-black ${
                 isActive ? 'bg-emerald-50 text-emerald-600' : 'active:bg-emerald-50'
               }`}
             >
               {item.icon}
               <span className="text-[8px] font-black uppercase mt-1 tracking-tighter">{item.name}</span>
             </button>
           );
        })}
      </nav>
    </div>
  );
}
