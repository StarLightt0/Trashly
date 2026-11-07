import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Encyclopedia from './pages/Encyclopedia';
import WasteDetail from './pages/WasteDetail';
import BankSampah from './pages/BankSampah';
import QuizList from './pages/QuizList';
import QuizPlay from './pages/QuizPlay';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Calculator from './pages/Calculator';
import ScanAI from './pages/ScanAI';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatWidget from './components/ChatWidget';

// Admin Components & Pages
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWaste from './pages/admin/AdminWaste';
import AdminBankSampah from './pages/admin/AdminBankSampah';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminScans from './pages/admin/AdminScans';
import AdminUsers from './pages/admin/AdminUsers';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Layout untuk tampilan publik
function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-brand-500 selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Admin Routes with Role Protection & Dedicated Layout */}
          <Route path="/admin" element={<AdminGuard />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="waste" element={<AdminWaste />} />
              <Route path="bank-sampah" element={<AdminBankSampah />} />
              <Route path="quizzes" element={<AdminQuizzes />} />
              <Route path="scans" element={<AdminScans />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>

          {/* Public Routes with Navbar, Footer & ChatWidget */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/ensiklopedia" element={<Encyclopedia />} />
            <Route path="/ensiklopedia/:id" element={<WasteDetail />} />
            <Route path="/scan" element={<ScanAI />} />
            <Route path="/bank-sampah" element={<BankSampah />} />
            <Route path="/kuis" element={<QuizList />} />
            <Route path="/kuis/:id" element={<QuizPlay />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/kalkulator" element={<Calculator />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
