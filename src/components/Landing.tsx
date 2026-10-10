import { useState } from 'react';
import { Link2, Zap, Shield, BarChart3, ArrowRight, Copy, Check, Globe, Smartphone, Clock } from 'lucide-react';
import { generateShortCode, isValidUrl, saveUrl, getUrls } from '../utils/storage';
import { getCurrentUser } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

interface LandingProps {
  setCurrentPage: (page: string) => void;
}

export default function Landing({ setCurrentPage }: LandingProps) {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleShorten = () => {
    setError('');
    if (!url) {
      setError('Masukkan URL terlebih dahulu');
      return;
    }
    if (!isValidUrl(url)) {
      setError('Format URL tidak valid. Gunakan format: https://example.com');
      return;
    }

    const shortCode = generateShortCode();
    const shortUrl = `lnk.zip/${shortCode}`;
    const user = getCurrentUser();

    const newUrl = {
      id: uuidv4(),
      originalUrl: url,
      shortCode,
      shortUrl,
      clicks: 0,
      createdAt: new Date().toISOString(),
      userId: user?.id || 'guest',
      title: url.replace(/https?:\/\//, '').split('/')[0],
    };

    saveUrl(newUrl);
    setShortenedUrl(shortUrl);
    setUrl('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://${shortenedUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalUrls = getUrls().length;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                {totalUrls.toLocaleString()}+ URL sudah diperpendek
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Perpendek URL Anda,
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Perbesar Jangkauan
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Platform URL shortener terpercaya untuk bisnis dan personal. 
              Kelola link, pantau klik, dan tingkatkan engagement Anda.
            </p>

            {/* URL Shortener Form */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setError(''); }}
                      placeholder="Tempel URL panjang Anda di sini..."
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-gray-700"
                      onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
                    />
                  </div>
                  <button
                    onClick={handleShorten}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all whitespace-nowrap"
                  >
                    Perpendek
                  </button>
                </div>
                {error && (
                  <p className="text-red-500 text-sm mt-2 text-left">{error}</p>
                )}
                
                {shortenedUrl && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <p className="text-xs text-green-600 font-medium mb-1">URL berhasil diperpendek!</p>
                        <p className="text-blue-600 font-semibold text-lg">https://{shortenedUrl}</p>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-white border border-green-300 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                Tidak perlu daftar untuk mencoba.{' '}
                <button onClick={() => setCurrentPage('register')} className="text-blue-600 font-medium hover:underline">
                  Daftar gratis
                </button>{' '}
                untuk fitur lebih lengkap.
              </p>
              <div className="mt-3 flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setCurrentPage('xampp')}
                  className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium hover:underline bg-orange-50 px-3 py-1.5 rounded-full"
                >
                  🖥️ Cara Install di XAMPP →
                </button>
                <button
                  onClick={() => setCurrentPage('backend')}
                  className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium hover:underline bg-purple-50 px-3 py-1.5 rounded-full"
                >
                  📦 Backend Setup (PHP/MySQL) →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk mengelola dan mengoptimalkan link Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Super Cepat',
                desc: 'Redirect dalam milidetik. Infrastruktur CDN global untuk performa terbaik.',
                color: 'from-yellow-400 to-orange-500',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Analitik Lengkap',
                desc: 'Pantau jumlah klik, lokasi pengunjung, dan perangkat yang digunakan.',
                color: 'from-blue-400 to-cyan-500',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Aman & Terpercaya',
                desc: 'Enkripsi SSL, proteksi malware, dan uptime 99.9% untuk link Anda.',
                color: 'from-green-400 to-emerald-500',
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: 'Mobile Friendly',
                desc: 'Kelola link dari mana saja. Responsif di semua perangkat.',
                color: 'from-purple-400 to-pink-500',
              },
              {
                icon: <Link2 className="w-6 h-6" />,
                title: 'Custom Alias',
                desc: 'Buat link yang mudah diingat dengan custom alias Anda sendiri.',
                color: 'from-red-400 to-rose-500',
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'Link Expiration',
                desc: 'Atur waktu kedaluwarsa untuk link Anda secara otomatis.',
                color: 'from-indigo-400 to-blue-500',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10M+', label: 'Link Dibuat' },
              { value: '500K+', label: 'Pengguna Aktif' },
              { value: '99.9%', label: 'Uptime' },
              { value: '150+', label: 'Negara' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-blue-100 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Siap Memulai?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Bergabung dengan ribuan pengguna yang sudah mempercayai LinkZip untuk mengelola link mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentPage('register')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow inline-flex items-center justify-center gap-2"
            >
              Mulai Gratis <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage('pricing')}
              className="bg-white border border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Lihat Harga
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
