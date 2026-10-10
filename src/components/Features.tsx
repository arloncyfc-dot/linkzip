import { Zap, Shield, BarChart3, Globe, Smartphone, Clock, Link2, Code, Users, Palette } from 'lucide-react';

interface FeaturesProps {
  setCurrentPage: (page: string) => void;
}

export default function Features({ setCurrentPage }: FeaturesProps) {
  const features = [
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'Redirect Super Cepat',
      desc: 'Infrastruktur CDN global memastikan redirect dalam milidetik. Pengunjung Anda tidak akan menunggu.',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Analitik Real-time',
      desc: 'Pantau performa link secara real-time. Lihat jumlah klik, lokasi pengunjung, perangkat, dan referrer.',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: 'Keamanan Terjamin',
      desc: 'Semua link diproteksi dengan SSL. Scan otomatis untuk malware dan phishing link.',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: <Globe className="w-7 h-7" />,
      title: 'Custom Domain',
      desc: 'Gunakan domain Anda sendiri untuk link yang lebih profesional dan branded.',
      color: 'from-purple-400 to-pink-500',
    },
    {
      icon: <Smartphone className="w-7 h-7" />,
      title: 'Mobile Optimized',
      desc: 'Kelola semua link dari smartphone Anda. Interface responsif di semua perangkat.',
      color: 'from-red-400 to-rose-500',
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: 'Link Expiration',
      desc: 'Atur waktu kedaluwarsa otomatis untuk link sementara atau promosi.',
      color: 'from-indigo-400 to-blue-500',
    },
    {
      icon: <Link2 className="w-7 h-7" />,
      title: 'Custom Alias',
      desc: 'Buat link yang mudah diingat dengan custom alias. Contoh: lnk.zip/promo-lebaran.',
      color: 'from-teal-400 to-green-500',
    },
    {
      icon: <Code className="w-7 h-7" />,
      title: 'API Access',
      desc: 'Integrasikan URL shortener ke aplikasi Anda dengan REST API yang lengkap.',
      color: 'from-orange-400 to-red-500',
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: 'Team Management',
      desc: 'Kelola link bersama tim Anda. Atur permission dan akses untuk setiap anggota.',
      color: 'from-pink-400 to-purple-500',
    },
    {
      icon: <Palette className="w-7 h-7" />,
      title: 'QR Code Generator',
      desc: 'Generate QR code otomatis untuk setiap link. Download dalam berbagai format.',
      color: 'from-cyan-400 to-blue-500',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Fitur Lengkap untuk
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mengelola Link Anda
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Semua tools yang Anda butuhkan untuk membuat, mengelola, dan menganalisis link dalam satu platform.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-12">
            Cara Kerja
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Tempel URL', desc: 'Masukkan URL panjang yang ingin Anda perpendek' },
              { step: '2', title: 'Perpendek', desc: 'Klik tombol dan dapatkan URL pendek secara instan' },
              { step: '3', title: 'Bagikan', desc: 'Bagikan link pendek dan pantau performanya' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Mulai Sekarang, Gratis!
          </h2>
          <p className="text-gray-600 mb-8">
            Tidak perlu kartu kredit. Daftar dan mulai perpendek URL dalam hitungan detik.
          </p>
          <button
            onClick={() => setCurrentPage('register')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Daftar Gratis Sekarang
          </button>
        </div>
      </section>
    </div>
  );
}
