import { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, setCurrentUser, getUsers, saveUser } from './utils/storage';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import Auth from './components/Auth';
import Pricing from './components/Pricing';
import Features from './components/Features';
import Dashboard from './components/Dashboard';
import Footer from './components/Footer';
import BackendDocs from './components/BackendDocs';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    // Create demo user if not exists
    const users = getUsers();
    if (!users.find(u => u.email === 'demo@linkzip.com')) {
      const demoUser: User = {
        id: 'demo-user-001',
        name: 'Demo User',
        email: 'demo@linkzip.com',
        plan: 'pro',
        createdAt: '2024-01-15T00:00:00.000Z',
      };
      saveUser(demoUser);
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentUser(null);
    setCurrentPage('home');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Landing setCurrentPage={setCurrentPage} />;
      case 'login':
        return <Auth mode="login" setCurrentPage={setCurrentPage} onLogin={handleLogin} />;
      case 'register':
        return <Auth mode="register" setCurrentPage={setCurrentPage} onLogin={handleLogin} />;
      case 'pricing':
        return <Pricing setCurrentPage={setCurrentPage} isLoggedIn={!!user} />;
      case 'features':
        return <Features setCurrentPage={setCurrentPage} />;
      case 'backend':
        return <BackendDocs setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        if (!user) {
          return <Auth mode="login" setCurrentPage={setCurrentPage} onLogin={handleLogin} />;
        }
        return (
          <Dashboard
            user={user}
            setCurrentPage={setCurrentPage}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return <Landing setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isLoggedIn={!!user}
        userName={user?.name}
        onLogout={handleLogout}
      />
      <main className="flex-1">
        {renderPage()}
      </main>
      <Footer setCurrentPage={setCurrentPage} />
    </div>
  );
}

export default App;
