import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Calendar, Image, User, LogOut, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore.js';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Camera, label: '发现' },
    { path: '/schedules', icon: Calendar, label: '档期' },
    { path: '/shootings', icon: Calendar, label: '拍摄计划' },
    { path: '/works', icon: Image, label: '作品' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-charcoal-800/90 backdrop-blur-md border-b border-charcoal-600">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Camera className="w-8 h-8 text-gold-500" />
            <span className="font-display text-2xl font-bold gold-text-gradient">LensMeet</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-1 px-4 py-2 rounded-lg text-cream-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all duration-300"
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={user?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                    alt={user?.realName}
                    className="w-8 h-8 rounded-full border-2 border-gold-500/50 object-cover"
                  />
                  <span className="text-cream-300 text-sm">{user?.realName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400">
                    {user?.role === 'photographer' ? '摄影师' : '模特'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-cream-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title="退出登录"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  登录
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  注册
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 text-cream-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-charcoal-600">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 mb-4 px-2">
                  <img
                    src={user?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                    alt={user?.realName}
                    className="w-10 h-10 rounded-full border-2 border-gold-500/50 object-cover"
                  />
                  <div>
                    <p className="text-cream-300 font-medium">{user?.realName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400">
                      {user?.role === 'photographer' ? '摄影师' : '模特'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center space-x-3 px-4 py-3 rounded-lg text-cream-400 hover:text-gold-500 hover:bg-gold-500/10 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 mt-4 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>退出登录</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 px-2">
                <Link
                  to="/login"
                  className="block w-full btn-secondary text-center py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="block w-full btn-primary text-center py-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
