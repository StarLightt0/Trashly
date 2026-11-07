import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.includes('/admin/waste')) return 'Manajemen Ensiklopedia Sampah';
    if (pathname.includes('/admin/bank-sampah')) return 'Manajemen Direktori Bank Sampah';
    if (pathname.includes('/admin/quizzes')) return 'Manajemen Kuis & Bank Soal';
    if (pathname.includes('/admin/scans')) return 'Log Pemindaian Visual Scan AI';
    if (pathname.includes('/admin/users')) return 'Manajemen Pengguna & Eco-Points';
    return 'Dashboard & Statistik Platform';
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        <AdminTopbar
          onOpenSidebar={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
