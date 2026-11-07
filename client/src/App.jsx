import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Encyclopedia from './pages/Encyclopedia';
import WasteDetail from './pages/WasteDetail';
import QuizList from './pages/QuizList';
import QuizPlay from './pages/QuizPlay';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import Register from './pages/Register';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ensiklopedia" element={<Encyclopedia />} />
              <Route path="/ensiklopedia/:id" element={<WasteDetail />} />
              <Route path="/kuis" element={<QuizList />} />
              <Route path="/kuis/:id" element={<QuizPlay />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/kalkulator" element={<Calculator />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
