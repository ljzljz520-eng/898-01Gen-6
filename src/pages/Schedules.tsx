import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Calendar, DollarSign, Filter, X } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import ScheduleCard from '../components/ScheduleCard.js';

const ROLE_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'photographer', label: '摄影师' },
  { value: 'model', label: '模特' },
];

const STYLE_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: '人像', label: '人像' },
  { value: '街拍', label: '街拍' },
  { value: '婚纱', label: '婚纱' },
  { value: '夜景', label: '夜景' },
  { value: '复古', label: '复古' },
  { value: '小清新', label: '小清新' },
];

const FEE_RANGES = [
  { value: 'all', label: '全部', min: 0, max: Infinity },
  { value: '0', label: '免费', min: 0, max: 0 },
  { value: '0-500', label: '¥0 - ¥500', min: 0, max: 500 },
  { value: '500-1000', label: '¥500 - ¥1000', min: 500, max: 1000 },
  { value: '1000-2000', label: '¥1000 - ¥2000', min: 1000, max: 2000 },
  { value: '2000+', label: '¥2000 以上', min: 2000, max: Infinity },
];

interface Filters {
  city: string;
  role: string;
  style: string;
  feeRange: string;
  dateFrom: string;
  dateTo: string;
}

export default function Schedules() {
  const { schedules, isLoading, fetchSchedules } = useStore();

  const [filters, setFilters] = useState<Filters>({
    city: '',
    role: 'all',
    style: 'all',
    feeRange: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      if (filters.city && !schedule.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      if (filters.role !== 'all' && schedule.user?.role !== filters.role) {
        return false;
      }

      if (filters.style !== 'all' && !schedule.style.includes(filters.style)) {
        return false;
      }

      if (filters.feeRange !== 'all') {
        const feeRange = FEE_RANGES.find((r) => r.value === filters.feeRange);
        if (feeRange) {
          if (schedule.feeType === 'free') {
            if (feeRange.min !== 0 || feeRange.max !== 0) {
              return feeRange.min === 0;
            }
          } else if (schedule.feeType === 'paid') {
            if (schedule.fee < feeRange.min || schedule.fee > feeRange.max) {
              return false;
            }
          }
        }
      }

      if (filters.dateFrom && schedule.date < filters.dateFrom) {
        return false;
      }

      if (filters.dateTo && schedule.date > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [schedules, filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      role: 'all',
      style: 'all',
      feeRange: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some((v) => v && v !== 'all');

  const FilterButton = ({ value, currentValue, onClick, label }: { value: string; currentValue: string; onClick: () => void; label: string }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        currentValue === value
          ? 'bg-gold-500 text-charcoal-900 shadow-gold-glow'
          : 'bg-charcoal-700 text-cream-400 hover:bg-charcoal-600 hover:text-gold-400'
      }`}
    >
      {label}
    </button>
  );

  const SidebarFilters = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-cream-300 font-semibold mb-3 flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-gold-500" />
          费用范围
        </h3>
        <div className="space-y-2">
          {FEE_RANGES.map((range) => (
            <FilterButton
              key={range.value}
              value={range.value}
              currentValue={filters.feeRange}
              onClick={() => handleFilterChange('feeRange', range.value)}
              label={range.label}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-cream-300 font-semibold mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-gold-500" />
          日期范围
        </h3>
        <div className="space-y-3">
          <div>
            <label className="form-label text-xs">开始日期</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>
          <div>
            <label className="form-label text-xs">结束日期</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="input-field text-sm py-2"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full btn-secondary text-sm py-2 flex items-center justify-center"
        >
          <X className="w-4 h-4 mr-2" />
          清除筛选
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cream-100 mb-2 font-display">
            发现<span className="gold-text-gradient">拍摄档期</span>
          </h1>
          <p className="text-cream-500">浏览并预约合适的拍摄合作机会</p>
        </div>

        <div className="bg-charcoal-800/50 backdrop-blur-sm border border-charcoal-700 rounded-xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="text"
                placeholder="搜索城市..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="flex gap-4 lg:hidden">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="btn-secondary flex items-center px-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-cream-500 text-sm">角色：</span>
                <div className="flex gap-2">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => handleFilterChange('role', role.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                        filters.role === role.value
                          ? 'bg-gold-500 text-charcoal-900 font-medium'
                          : 'text-cream-400 hover:text-gold-400'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-cream-500 text-sm">风格：</span>
                <div className="flex gap-2 flex-wrap">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => handleFilterChange('style', style.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                        filters.style === style.value
                          ? 'bg-gold-500 text-charcoal-900 font-medium'
                          : 'text-cream-400 hover:text-gold-400'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden mt-4 pt-4 border-t border-charcoal-700">
            <div className="space-y-4">
              <div>
                <label className="form-label text-sm">角色筛选</label>
                <div className="flex gap-2 flex-wrap">
                  {ROLE_OPTIONS.map((role) => (
                    <FilterButton
                      key={role.value}
                      value={role.value}
                      currentValue={filters.role}
                      onClick={() => handleFilterChange('role', role.value)}
                      label={role.label}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label text-sm">风格筛选</label>
                <div className="flex gap-2 flex-wrap">
                  {STYLE_OPTIONS.map((style) => (
                    <FilterButton
                      key={style.value}
                      value={style.value}
                      currentValue={filters.style}
                      onClick={() => handleFilterChange('style', style.value)}
                      label={style.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-charcoal-800/50 backdrop-blur-sm border border-charcoal-700 rounded-xl p-4 sticky top-4">
              <h2 className="text-lg font-semibold text-cream-100 mb-4 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-gold-500" />
                高级筛选
              </h2>
              <SidebarFilters />
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-cream-500">
                共 <span className="text-gold-400 font-medium">{filteredSchedules.length}</span> 个档期
                {hasActiveFilters && <span className="text-cream-600">（已筛选）</span>}
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="card animate-pulse"
                  >
                    <div className="h-48 bg-charcoal-700" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-charcoal-700 rounded w-3/4" />
                      <div className="h-3 bg-charcoal-700 rounded w-1/2" />
                      <div className="h-3 bg-charcoal-700 rounded w-full" />
                      <div className="h-8 bg-charcoal-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSchedules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSchedules.map((schedule) => (
                  <ScheduleCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-charcoal-700 rounded-full flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-charcoal-500" />
                </div>
                <h3 className="text-xl font-semibold text-cream-200 mb-2">暂无匹配的档期</h3>
                <p className="text-cream-500 mb-6">
                  {hasActiveFilters
                    ? '尝试调整筛选条件，或清除所有筛选查看全部档期'
                    : '目前还没有发布的档期，敬请期待'}
                </p>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="btn-primary">
                    清除筛选条件
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal-900/80 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-charcoal-800 border-l border-charcoal-700 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-cream-100">筛选条件</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 text-cream-400 hover:text-gold-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarFilters />
          </div>
        </div>
      )}
    </div>
  );
}
