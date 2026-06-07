import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Shield, Zap, Calendar, ArrowRight, Star, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import ScheduleCard from '../components/ScheduleCard.js';
import WorkCard from '../components/WorkCard.js';

export default function Home() {
  const navigate = useNavigate();
  const { schedules, publicWorks, fetchSchedules, fetchPublicWorks, isLoading } = useStore();

  useEffect(() => {
    fetchSchedules();
    fetchPublicWorks();
  }, [fetchSchedules, fetchPublicWorks]);

  const displayedSchedules = schedules.slice(0, 6);
  const displayedWorks = publicWorks.slice(0, 8);

  const features = [
    {
      icon: Star,
      title: '专业信用系统',
      description: '基于真实合作评价的信用体系，让每次合作都有可靠保障',
    },
    {
      icon: Shield,
      title: '安全授权机制',
      description: '作品授权双方确认后才可公开，保护您的创作权益',
    },
    {
      icon: Zap,
      title: '高效匹配',
      description: '智能推荐匹配的摄影师与模特，让创作一拍即合',
    },
  ];

  return (
    <div className="min-h-screen bg-charcoal-800">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 mb-8">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-gold-400 text-sm font-medium">连接摄影师与模特的专业平台</span>
            </span>
          </div>
          
          <h1 
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-cream-100 mb-6 leading-tight animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            让每一次拍摄
            <br />
            <span className="gold-text-gradient">都成为经典</span>
          </h1>
          
          <p 
            className="text-lg md:text-xl text-cream-400 max-w-2xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            在这里，摄影师与模特相遇，共同创造令人惊艳的作品。
            安全、专业、高效的约拍平台。
          </p>
          
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Link
              to="/schedules/new"
              className="group btn-primary text-lg px-8 py-4 flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <Calendar className="w-5 h-5" />
              <span>发布档期</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/schedules"
              className="group btn-secondary text-lg px-8 py-4 flex items-center space-x-2 w-full sm:w-auto justify-center"
            >
              <Camera className="w-5 h-5" />
              <span>浏览档期</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div 
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-gold-400">5000+</p>
              <p className="text-sm text-cream-500">认证用户</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-gold-400">10000+</p>
              <p className="text-sm text-cream-500">成功约拍</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-display font-bold text-gold-400">20000+</p>
              <p className="text-sm text-cream-500">优质作品</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-gold-500/50 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gold-500 rounded-full" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-900">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-100 mb-2">
                最新档期
              </h2>
              <p className="text-cream-500">发现优质拍摄机会</p>
            </div>
            <Link
              to="/schedules"
              className="hidden sm:flex items-center space-x-2 text-gold-400 hover:text-gold-300 transition-colors"
            >
              <span>查看全部</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-96 animate-pulse">
                  <div className="h-48 bg-charcoal-700" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-charcoal-700 rounded w-1/2" />
                    <div className="h-4 bg-charcoal-700 rounded w-3/4" />
                    <div className="h-4 bg-charcoal-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayedSchedules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSchedules.map((schedule, index) => (
                <div 
                  key={schedule.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ScheduleCard 
                    schedule={schedule}
                    onBook={(s) => navigate(`/schedule/${s.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-charcoal-700 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-charcoal-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-cream-300 mb-2">暂无档期</h3>
              <p className="text-cream-500 mb-6">成为第一个发布档期的用户吧</p>
              <button
                onClick={() => navigate('/schedules/new')}
                className="btn-primary"
              >
                发布档期
              </button>
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link
              to="/schedules"
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <span>查看全部档期</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-100 mb-2">
                精选作品
              </h2>
              <p className="text-cream-500">欣赏来自平台的优秀创作</p>
            </div>
            <Link
              to="/works"
              className="hidden sm:flex items-center space-x-2 text-gold-400 hover:text-gold-300 transition-colors"
            >
              <span>查看全部</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card aspect-[3/4] animate-pulse">
                  <div className="h-full bg-charcoal-700" />
                </div>
              ))}
            </div>
          ) : displayedWorks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {displayedWorks.map((work, index) => (
                <div 
                  key={work.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <WorkCard 
                    work={work}
                    onView={(w) => navigate(`/work/${w.id}`)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-charcoal-700 flex items-center justify-center">
                <Camera className="w-10 h-10 text-charcoal-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-cream-300 mb-2">暂无公开作品</h3>
              <p className="text-cream-500">完成拍摄并授权后，作品将展示在这里</p>
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Link
              to="/works"
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <span>查看全部作品</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-charcoal-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-cream-100 mb-4">
              为什么选择我们
            </h2>
            <p className="text-cream-500 max-w-xl mx-auto">
              我们致力于打造最专业、最安全的约拍平台，让创作更纯粹
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card p-8 text-center group cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-gold-400" />
                </div>
                <h3 className="font-display text-xl font-bold text-cream-100 mb-3 group-hover:text-gold-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-cream-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-charcoal-800">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-cream-100 mb-6">
              准备好开始你的
              <br />
              <span className="gold-text-gradient">创作之旅了吗？</span>
            </h2>
            <p className="text-cream-500 text-lg mb-10">
              立即加入平台，与志同道合的创作者一起，创造精彩
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
              >
                免费注册
              </Link>
              <Link
                to="/schedules"
                className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
              >
                先逛逛
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-charcoal-900 border-t border-charcoal-700 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Camera className="w-6 h-6 text-gold-400" />
              <span className="font-display text-xl font-bold text-cream-100">约拍平台</span>
            </div>
            <p className="text-cream-600 text-sm">
              © 2024 约拍平台. 让每一次拍摄都成为经典.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
