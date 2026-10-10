import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { getUsers, saveUser, setCurrentUser, generateShortCode } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { User as UserType } from '../types';

interface AuthProps {
  mode: 'login' | 'register';
  setCurrentPage: (page: string) => void;
  onLogin: (user: UserType) => void;
}

export default function Auth({ mode, setCurrentPage, onLogin }: AuthProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (mode === 'register') {
        if (!name || !email || !password) {
          setError('Semua field harus diisi');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password minimal 6 karakter');
          setLoading(false);
          return;
        }
        const users = getUsers();
        if (users.find(u => u.email === email)) {
          setError('Email sudah terdaftar');
          setLoading(false);
          return;
        }

        const newUser: UserType = {
          id: uuidv4(),
          name,
          email,
          plan: 'free',
          createdAt: new Date().toISOString(),
        };
        saveUser(newUser);
        setCurrentUser(newUser);
        onLogin(newUser);
        setCurrentPage('dashboard');
      } else {
        if (!email || !password) {
          setError('Email dan password harus diisi');
          setLoading(false);
          return;
        }
        const users = getUsers();
        const user = users.find(u => u.email === email);
        if (!user) {
          setError('Email tidak ditemukan');
          setLoading(false);
          return;
        }
        setCurrentUser(user);
        onLogin(user);
        setCurrentPage('dashboard');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              {mode === 'login' ? (
                <Lock className="w-7 h-7 text-white" />
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}
            </h2>
            <p className="text-gray-500 mt-2">
              {mode === 'login'
                ? 'Masuk untuk mengelola link Anda'
                : 'Daftar gratis dan mulai perpendek URL'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' ? 'Masuk' : 'Daftar'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-gray-500 text-sm">
                Belum punya akun?{' '}
                <button
                  onClick={() => setCurrentPage('register')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Daftar gratis
                </button>
              </p>
            ) : (
              <p className="text-gray-500 text-sm">
                Sudah punya akun?{' '}
                <button
                  onClick={() => setCurrentPage('login')}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Masuk
                </button>
              </p>
            )}
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs text-blue-600 font-medium mb-1">💡 Demo Login:</p>
            <p className="text-xs text-blue-500">Email: demo@linkzip.com</p>
            <p className="text-xs text-blue-500">Password: demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
