import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore.js';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username.trim() || !password.trim()) {
      setLocalError('请填写用户名和密码');
      return;
    }

    try {
      await login({ username: username.trim(), password });
      navigate('/');
    } catch (err) {
      // Error is handled by store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 mb-4">
            <Camera className="w-8 h-8 text-gold-500" />
          </div>
          <h1 className="font-display text-3xl font-bold gold-text-gradient mb-2">
            LensMeet
          </h1>
          <p className="text-cream-400">登录你的账户，开始创作之旅</p>
        </div>

        <div className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {localError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {localError}
              </div>
            )}

            <div>
              <label className="form-label">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="form-label">密码</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-400 hover:text-cream-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>登录中...</span>
                </>
              ) : (
                <span>登录</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal-600 text-center">
            <p className="text-cream-400 text-sm">
              还没有账户？{' '}
              <Link to="/register" className="text-gold-500 hover:text-gold-400 font-medium">
                立即注册
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-charcoal-700/50 border border-charcoal-600">
            <p className="text-cream-400 text-xs mb-2">测试账号：</p>
            <p className="text-cream-300 text-xs">摄影师：photo_liwei / password123</p>
            <p className="text-cream-300 text-xs">模特：model_xiaoyue / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
