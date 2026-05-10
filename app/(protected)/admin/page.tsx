"use client";

import React, { useState } from 'react';
import { Shield, Trash2, CheckCircle, AlertTriangle, Users, Settings } from 'lucide-react';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('pending');

  const pendingActions = [
    { id: 1, user: "Ravi K.", action: "Planted 10 Trees", proofUrl: "placeholder", date: "10 mins ago" },
    { id: 2, user: "Amit P.", action: "Cleaned Local Beach", proofUrl: "placeholder", date: "1 hr ago" },
    { id: 3, user: "Sonia R.", action: "Composting Setup", proofUrl: "placeholder", date: "2 hrs ago" },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <section className="space-y-2 border-b-4 border-black pb-6 flex items-start justify-between">
        <div>
           <div className="inline-block border-2 border-black bg-red-500 text-white px-3 py-1 text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-2 flex items-center gap-2">
             <Shield size={12} /> Admin Access Only
           </div>
           <h1 className="text-4xl font-black uppercase italic sm:text-6xl tracking-tighter leading-none">
             COMMAND <span className="text-red-500 underline decoration-black decoration-4 underline-offset-4 italic">CENTER</span>
           </h1>
           <p className="font-bold text-slate-700 italic mt-2">Oversee the Level Up Earth ecosystem.</p>
        </div>
        <div className="hidden sm:flex gap-4">
           <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-3xl font-black text-red-500">142</div>
              <div className="text-[10px] uppercase font-bold tracking-widest">Pending Verification</div>
           </div>
           <div className="border-4 border-black p-4 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-3xl font-black text-emerald-600">12.5k</div>
              <div className="text-[10px] uppercase font-bold tracking-widest">Total Users</div>
           </div>
        </div>
      </section>

      {/* Quick Actions Nav */}
      <div className="flex gap-4 border-b-4 border-black pb-4 overflow-x-auto">
         <button 
           onClick={() => setActiveTab('pending')}
           className={`border-2 border-black px-6 py-2 font-black uppercase tracking-widest text-sm transition-all whitespace-nowrap ${
             activeTab === 'pending' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' : 'bg-white hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
           }`}
         >
           Pending Actions
         </button>
         <button 
           onClick={() => setActiveTab('users')}
           className={`border-2 border-black px-6 py-2 font-black uppercase tracking-widest text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
             activeTab === 'users' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' : 'bg-white hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
           }`}
         >
           <Users size={16} /> Users
         </button>
         <button 
           onClick={() => setActiveTab('settings')}
           className={`border-2 border-black px-6 py-2 font-black uppercase tracking-widest text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
             activeTab === 'settings' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' : 'bg-white hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
           }`}
         >
           <Settings size={16} /> Global Config
         </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'pending' && (
        <section className="space-y-4">
           <div className="flex items-center gap-2 bg-yellow-100 border-2 border-black p-4 mb-6">
              <AlertTriangle size={20} className="text-yellow-600" />
              <p className="text-xs font-bold uppercase tracking-wide">Review user submitted actions carefully before approving points.</p>
           </div>

           {pendingActions.map(action => (
              <div key={action.id} className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                 
                 <div className="flex gap-4 items-start w-full md:w-auto">
                    <div className="w-24 h-24 bg-slate-200 border-2 border-black flex items-center justify-center font-black text-slate-400 uppercase text-xs text-center p-2">
                       [Proof Image]
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tight">{action.action}</h3>
                       <p className="text-sm font-bold text-slate-600 mb-2">By: {action.user}</p>
                       <p className="text-[10px] uppercase font-bold text-slate-400">{action.date}</p>
                    </div>
                 </div>

                 <div className="flex gap-3 w-full md:w-auto justify-end">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border-2 border-black bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-4 py-3 font-black uppercase text-xs transition-colors">
                       <Trash2 size={16} /> Reject
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 border-2 border-black bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white px-4 py-3 font-black uppercase text-xs transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                       <CheckCircle size={16} /> Approve
                    </button>
                 </div>

              </div>
           ))}
        </section>
      )}

      {activeTab === 'users' && (
        <section className="py-12 text-center border-4 border-black bg-slate-50 border-dashed">
           <Users size={48} className="mx-auto text-slate-300 mb-4" />
           <h2 className="text-2xl font-black uppercase italic text-slate-400">User Management Interface</h2>
           <p className="text-sm font-bold text-slate-500 mt-2">Search, ban, or grant admin rights to users.</p>
        </section>
      )}

      {activeTab === 'settings' && (
        <section className="py-12 text-center border-4 border-black bg-slate-50 border-dashed">
           <Settings size={48} className="mx-auto text-slate-300 mb-4" />
           <h2 className="text-2xl font-black uppercase italic text-slate-400">System Configuration</h2>
           <p className="text-sm font-bold text-slate-500 mt-2">Adjust point multipliers, manage categories, and system flags.</p>
        </section>
      )}

    </div>
  );
}
