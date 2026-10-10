import { useState, useEffect } from 'react';
import {
  Link2, Copy, Check, Trash2, ExternalLink, Plus, BarChart3,
  Globe, Clock, TrendingUp, Eye, Settings, CreditCard, LogOut
} from 'lucide-react';
import { User, ShortenedUrl } from '../types';
import { getUrls, saveUrl, deleteUrl, generateShortCode, isValidUrl, getCurrentUser, setCurrentUser, saveUser } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { plans } from '../data/plans';

interface DashboardProps {
  user: User;
  setCurrentPage: (page: string) => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

export default function Dashboard({ user, setCurrentPage, onLogout, onUpdateUser }: DashboardProps) {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'analytics' | 'settings' | 'billing'>('links');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadUrls();
  }, [user.id]);

  const loadUrls = () => {
    const userUrls = getUrls(user.id);
    setUrls(userUrls.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleShorten = () => {
    setError('');
    if (!newUrl) {
      setError('Masukkan URL terlebih dahulu');
      return;
    }
    if (!isValidUrl(newUrl)) {
      setError('Format URL tidak valid');
      return;
    }

    const currentPlan = plans.find(p => p.id === user.plan);
    if (currentPlan && currentPlan.limits.urls !== -1 && urls.length >= currentPlan.limits.urls) {
      setError(`Batas URL tercapai (${currentPlan.limits.urls}). Upgrade paket untuk menambah limit.`);
      return;
    }

    const shortCode = customAlias || generateShortCode();
    const shortUrl = `lnk.zip/${shortCode}`;

    const newShortUrl: ShortenedUrl = {
      id: uuidv4(),
      originalUrl: newUrl,
      shortCode,
      shortUrl,
      clicks: 0,
      createdAt: new Date().toISOString(),
      userId: user.id,
      title: newUrl.replace(/https?:\/\//, '').split('/')[0],
    };

    saveUrl(newShortUrl);
    setNewUrl('');
    setCustomAlias('');
    loadUrls();
  };

  const handleCopy = (url: ShortenedUrl) => {
    navigator.clipboard.writeText(`https://${url.shortUrl}`);
    setCopiedId(url.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    deleteUrl(id);
    loadUrls();
    setShowDeleteConfirm(null);
  };

  const handleUpgrade = (planId: string) => {
    const updatedUser = { ...user, plan: planId as User['plan'] };
    saveUser(updatedUser);
    setCurrentUser(updatedUser);
    onUpdateUser(updatedUser);
  };

  const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);
  const currentPlan = plans.find(p => p.id === user.plan);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Halo, {user.name} 👋
            </h1>
            <p className="text-gray-500 mt-1">Kelola link dan pantau performa Anda</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
              user.plan === 'free' ? 'bg-gray-100 text-gray-700' :
              user.plan === 'basic' ? 'bg-blue-100 text-blue-700' :
              user.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
              'bg-yellow-100 text-yellow-700'
            }`}>
              <CreditCard className="w-3 h-3" />
              Paket {currentPlan?.name}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Link2 className="w-5 h-5" />, label: 'Total Link', value: urls.length, color: 'bg-blue-500' },
            { icon: <Eye className="w-5 h-5" />, label: 'Total Klik', value: totalClicks, color: 'bg-green-500' },
            { icon: <TrendingUp className="w-5 h-5" />, label: 'Rata-rata Klik', value: urls.length ? Math.round(totalClicks / urls.length) : 0, color: 'bg-purple-500' },
            { icon: <BarChart3 className="w-5 h-5" />, label: 'Sisa Limit', value: currentPlan?.limits.urls === -1 ? '∞' : `${currentPlan?.limits.urls! - urls.length}`, color: 'bg-orange-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: 'links', label: 'Link Saya', icon: <Link2 className="w-4 h-4" /> },
                { id: 'analytics', label: 'Analitik', icon: <BarChart3 className="w-4 h-4" /> },
                { id: 'billing', label: 'Langganan', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'settings', label: 'Pengaturan', icon: <Settings className="w-4 h-4" /> },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Links Tab */}
            {activeTab === 'links' && (
              <div>
                {/* Add URL Form */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => { setNewUrl(e.target.value); setError(''); }}
                        placeholder="Tempel URL panjang..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                      />
                    </div>
                    {currentPlan?.limits.customAlias && (
                      <input
                        type="text"
                        value={customAlias}
                        onChange={(e) => setCustomAlias(e.target.value)}
                        placeholder="Custom alias (opsional)"
                        className="sm:w-48 px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
                      />
                    )}
                    <button
                      onClick={handleShorten}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Perpendek
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                {/* URL List */}
                {urls.length === 0 ? (
                  <div className="text-center py-12">
                    <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Belum ada link</p>
                    <p className="text-gray-400 text-sm mt-1">Mulai perpendek URL pertama Anda!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {urls.map((url) => (
                      <div
                        key={url.id}
                        className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-blue-600 font-semibold text-sm truncate">
                                https://{url.shortUrl}
                              </span>
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                {url.clicks} klik
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{url.originalUrl}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatDate(url.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(url)}
                              className="p-2 rounded-lg bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                              title="Salin"
                            >
                              {copiedId === url.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            <a
                              href={url.originalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                              title="Buka link"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            </a>
                            <button
                              onClick={() => setShowDeleteConfirm(url.id)}
                              className="p-2 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        {showDeleteConfirm === url.id && (
                          <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-sm text-red-600 flex-1">Hapus link ini?</p>
                            <button
                              onClick={() => handleDelete(url.id)}
                              className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg font-medium"
                            >
                              Hapus
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1.5 bg-white border border-red-200 text-red-600 text-xs rounded-lg font-medium"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performa Link</h3>
                {urls.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Belum ada data analitik</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Top Links */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-700 mb-3">🔥 Link Terpopuler</h4>
                      <div className="space-y-3">
                        {[...urls].sort((a, b) => b.clicks - a.clicks).slice(0, 5).map((url, idx) => (
                          <div key={url.id} className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-blue-600 truncate">{url.shortUrl}</p>
                              <p className="text-xs text-gray-400 truncate">{url.originalUrl}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{url.clicks}</p>
                              <p className="text-xs text-gray-400">klik</p>
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                style={{ width: `${totalClicks ? (url.clicks / totalClicks) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{totalClicks}</p>
                        <p className="text-sm text-blue-500">Total Klik</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{urls.length}</p>
                        <p className="text-sm text-green-500">Total Link</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {urls.length ? Math.round(totalClicks / urls.length) : 0}
                        </p>
                        <p className="text-sm text-purple-500">Rata-rata/Link</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Paket Langganan</h3>
                
                {/* Current Plan */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100 mb-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Paket saat ini</p>
                      <p className="text-xl font-bold text-gray-900">{currentPlan?.name}</p>
                      <p className="text-sm text-gray-500">
                        {currentPlan?.price === 0 ? 'Gratis' : `Rp ${currentPlan?.price.toLocaleString('id-ID')}/bulan`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Limit URL</p>
                      <p className="text-lg font-bold text-gray-900">
                        {currentPlan?.limits.urls === -1 ? 'Unlimited' : `${urls.length}/${currentPlan?.limits.urls}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Available Plans */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plans.filter(p => p.id !== user.plan).map((plan) => (
                    <div key={plan.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                        <span className="text-sm font-bold text-gray-900">
                          {plan.price === 0 ? 'Gratis' : `Rp ${plan.price.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                      <ul className="space-y-1 mb-4">
                        {plan.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500" /> {f}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                          plan.id === 'free'
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-md'
                        }`}
                      >
                        {plans.findIndex(p => p.id === user.plan) > plans.findIndex(p => p.id === plan.id)
                          ? 'Downgrade'
                          : 'Upgrade'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pengaturan Akun</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Nama</label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Bergabung sejak</label>
                    <input
                      type="text"
                      value={formatDate(user.createdAt)}
                      readOnly
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={onLogout}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar dari akun
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
