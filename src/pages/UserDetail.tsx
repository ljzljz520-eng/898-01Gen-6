import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Image, User, AlertTriangle, ArrowLeft, Camera, Sparkles } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import CreditScore from '../components/CreditScore.js';
import ScheduleCard from '../components/ScheduleCard.js';
import WorkCard from '../components/WorkCard.js';
import { User as UserType, Schedule, Work, ShootingPlan } from '../../shared/types.js';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    schedules,
    publicWorks,
    shootingPlans,
    isLoading,
    fetchSchedules,
    fetchPublicWorks,
    fetchShootingPlans,
    getUserById,
    clearError
  } = useStore();

  const [user, setUser] = useState<UserType | null>(null);
  const [userSchedules, setUserSchedules] = useState<Schedule[]>([]);
  const [userWorks, setUserWorks] = useState<Work[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [stats, setStats] = useState({ schedulesCount: 0, completedShootings: 0, publicWorksCount: 0 });

  useEffect(() => {
    const loadData = async () => {
      clearError();
      await Promise.all([
        fetchSchedules(),
        fetchPublicWorks(),
        fetchShootingPlans()
      ]);
    };
    loadData();
  }, [fetchSchedules, fetchPublicWorks, fetchShootingPlans, clearError]);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      const userId = parseInt(id);
      if (isNaN(userId)) {
        setNotFound(true);
        return;
      }

      const foundUser = await getUserById(userId);
      if (foundUser) {
        setUser(foundUser);
        setNotFound(false);

        const filteredSchedules = schedules.filter(s => s.userId === userId);
        setUserSchedules(filteredSchedules);

        const filteredWorks = publicWorks.filter(w => w.uploaderId === userId);
        setUserWorks(filteredWorks);

        const completed = shootingPlans.filter(
          (s: ShootingPlan) =>
            (s.requesterId === userId || s.recipientId === userId) &&
            s.status === 'completed'
        ).length;

        setStats({
          schedulesCount: filteredSchedules.length,
          completedShootings: completed,
          publicWorksCount: filteredWorks.length
        });
      } else {
        setNotFound(true);
      }
    };

    loadUser();
  }, [id, schedules, publicWorks, shootingPlans, getUserById]);

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-charcoal-900 flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <AlertTriangle className="w-16 h-16 text-gold-500 mx-auto mb-4" />
          <h1 className="text-2xl font-display text-cream-100 mb-2">用户不存在</h1>
          <p className="text-cream-400 mb-6">您访问的用户可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const roleLabel = user.role === 'photographer' ? '摄影师' : '模特';

  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="relative h-64 bg-gradient-to-br from-charcoal-800 via-charcoal-700 to-charcoal-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent" />
      </div>

      <div className="container max-w-7xl px-4 -mt-32 relative z-10 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-cream-400 hover:text-gold-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6 animate-fade-in-up">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={user.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                    alt={user.realName}
                    className="w-32 h-32 rounded-full border-4 border-gold-500/50 object-cover shadow-gold-glow"
                  />
                  <span className="absolute bottom-2 right-2 px-3 py-1 bg-gold-500 text-charcoal-900 text-xs font-medium rounded-full">
                    {roleLabel}
                  </span>
                </div>

                <h1 className="text-2xl font-display font-bold text-cream-100 mb-1">
                  {user.realName}
                </h1>

                <div className="flex items-center space-x-2 text-cream-400 mb-4">
                  <MapPin className="w-4 h-4 text-gold-500" />
                  <span>{user.city}</span>
                </div>

                <CreditScore score={user.creditScore} size="lg" />
              </div>

              {user.bio && (
                <div className="mt-6 pt-6 border-t border-charcoal-600">
                  <h3 className="text-sm font-medium text-cream-500 mb-2">简介</h3>
                  <p className="text-cream-300 text-sm leading-relaxed">{user.bio}</p>
                </div>
              )}

              {user.styles && user.styles.length > 0 && (
                <div className="mt-6 pt-6 border-t border-charcoal-600">
                  <h3 className="text-sm font-medium text-cream-500 mb-3">擅长风格</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.styles.map((style, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gold-500/10 text-gold-400 text-xs rounded-full border border-gold-500/30"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-display font-medium text-cream-100 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 text-gold-500 mr-2" />
                数据统计
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-gold-400">{stats.schedulesCount}</p>
                  <p className="text-xs text-cream-500 mt-1">发布档期</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-gold-400">{stats.completedShootings}</p>
                  <p className="text-xs text-cream-500 mt-1">完成拍摄</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-gold-400">{stats.publicWorksCount}</p>
                  <p className="text-xs text-cream-500 mt-1">公开作品</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/schedules"
                className="btn-secondary text-center text-sm py-3 flex items-center justify-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                查看档期
              </Link>
              <Link
                to="/works"
                className="btn-primary text-center text-sm py-3 flex items-center justify-center"
              >
                <Image className="w-4 h-4 mr-2" />
                查看作品
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {userSchedules.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-cream-100 flex items-center">
                      <Calendar className="w-5 h-5 text-gold-500 mr-2" />
                      发布的档期
                    </h2>
                    <p className="text-cream-500 text-sm mt-1">共 {userSchedules.length} 个档期</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userSchedules.map((schedule, index) => (
                    <div key={schedule.id} style={{ animationDelay: `${index * 0.1}s` }}>
                      <ScheduleCard schedule={schedule} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userWorks.length > 0 && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-cream-100 flex items-center">
                      <Camera className="w-5 h-5 text-gold-500 mr-2" />
                      公开作品
                    </h2>
                    <p className="text-cream-500 text-sm mt-1">共 {userWorks.length} 个作品</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userWorks.map((work, index) => (
                    <div key={work.id} style={{ animationDelay: `${index * 0.08}s` }}>
                      <WorkCard work={work} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userSchedules.length === 0 && userWorks.length === 0 && (
              <div className="card p-12 text-center animate-fade-in">
                <User className="w-16 h-16 text-charcoal-600 mx-auto mb-4" />
                <h3 className="text-xl font-display font-medium text-cream-300 mb-2">暂无内容</h3>
                <p className="text-cream-500">该用户尚未发布档期或作品</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
