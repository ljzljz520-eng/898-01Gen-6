import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Eye, EyeOff, Loader2, User, CameraIcon } from 'lucide-react';
import { useStore } from '../store/useStore.js';

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    phone: '',
    role: 'photographer' as 'photographer' | 'model',
    city: ''
  });
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

    if (!formData.username.trim() || !formData.password || !formData.realName.trim() || !formData.phone.trim() || !formData.city.trim()) {
      setLocalError('请填写所有必填字段');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('密码长度至少6位');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/');
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <p className="text-cream-400">创建新账户，加入摄影创作社区</p>
        </div>

        <div className="card p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {localError && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {localError}
              </div>
            )}

            <div>
              <label className="form-label">我是</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('role', 'photographer')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'photographer'
                      ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                      : 'border-charcoal-600 text-cream-400 hover:border-charcoal-500'
                  }`}
                >
                  <CameraIcon className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">摄影师</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('role', 'model')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.role === 'model'
                      ? 'border-gold-500 bg-gold-500/10 text-gold-400'
                      : 'border-charcoal-600 text-cream-400 hover:border-charcoal-500'
                  }`}
                >
                  <User className="w-6 h-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">模特</span>
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">用户名 *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className="input-field"
                placeholder="请输入用户名"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">真实姓名 *</label>
                <input
                  type="text"
                  value={formData.realName}
                  onChange={(e) => handleChange('realName', e.target.value)}
                  className="input-field"
                  placeholder="真实姓名"
                />
              </div>
              <div>
                <label className="form-label">所在城市 *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="input-field"
                  placeholder="例如：上海"
                />
              </div>
            </div>

            <div>
              <label className="form-label">手机号 *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="input-field"
                placeholder="请输入手机号"
              />
            </div>

            <div>
              <label className="form-label">密码 *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="input-field pr-12"
                  placeholder="至少6位密码"
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

            <div>
              <label className="form-label">确认密码 *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="input-field"
                placeholder="再次输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>注册中...</span>
                </>
              ) : (
                <span>注册</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-charcoal-600 text-center">
            <p className="text-cream-400 text-sm">
              已有账户？{' '}
              <Link to="/login" className="text-gold-500 hover:text-gold-400 font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
