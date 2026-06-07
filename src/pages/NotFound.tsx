import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-gold-500/10 rounded-full blur-3xl animate-pulse" />
          </div>
          <AlertTriangle className="w-20 h-20 text-gold-500 mx-auto relative z-10" />
        </div>

        <h1 className="text-8xl md:text-9xl font-display font-bold gold-text-gradient mb-4 animate-fade-in-up">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-display font-medium text-cream-100 mb-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          页面未找到
        </h2>

        <p className="text-cream-400 max-w-md mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          抱歉，您访问的页面不存在或已被移除。
          请检查网址是否正确，或返回首页继续浏览。
        </p>

        <Link
          to="/"
          className="btn-primary inline-flex items-center animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <Home className="w-5 h-5 mr-2" />
          返回首页
        </Link>

        <div className="mt-16 flex justify-center space-x-2 opacity-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gold-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
