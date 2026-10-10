import { Check, ArrowRight } from 'lucide-react';
import { plans } from '../data/plans';

interface PricingProps {
  setCurrentPage: (page: string) => void;
  isLoggedIn: boolean;
}

export default function Pricing({ setCurrentPage, isLoggedIn }: PricingProps) {
  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratis';
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Pilih Paket yang Tepat
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Mulai dari gratis, upgrade kapan saja sesuai kebutuhan Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${
                plan.popular
                  ? 'border-blue-500 shadow-lg scale-[1.02]'
                  : 'border-gray-100 hover:border-blue-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                  POPULER
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setCurrentPage(isLoggedIn ? 'dashboard' : 'register')}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.price === 0 ? 'Mulai Gratis' : 'Pilih Paket'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Pertanyaan Umum
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Apakah bisa upgrade/downgrade paket?',
                a: 'Ya, Anda bisa mengubah paket kapan saja. Perubahan akan berlaku pada periode billing berikutnya.',
              },
              {
                q: 'Metode pembayaran apa yang tersedia?',
                a: 'Kami menerima transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit/debit.',
              },
              {
                q: 'Apakah ada kontrak jangka panjang?',
                a: 'Tidak ada kontrak. Anda bisa berlangganan bulanan dan membatalkan kapan saja.',
              },
              {
                q: 'Bagaimana jika URL saya melebihi batas?',
                a: 'Anda akan mendapat notifikasi saat mendekati batas. Anda bisa upgrade paket atau menunggu periode berikutnya.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
