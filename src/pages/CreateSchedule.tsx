import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, DollarSign, Tags, Clock, Phone, FileText, Send, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import Navbar from '../components/Navbar.js';

const STYLE_OPTIONS = ['人像', '街拍', '婚纱', '夜景', '复古', '小清新', '商业', '私房'];
const FEE_TYPE_OPTIONS = [
  { value: 'free', label: '互勉' },
  { value: 'paid', label: '有偿' },
  { value: 'negotiable', label: '面议' }
];

interface FormErrors {
  title?: string;
  date?: string;
  city?: string;
  style?: string;
  fee?: string;
  contact?: string;
}

export default function CreateSchedule() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, createSchedule, clearError } = useStore();
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [feeType, setFeeType] = useState<'free' | 'paid' | 'negotiable'>('negotiable');
  const [fee, setFee] = useState('');
  const [feeNote, setFeeNote] = useState('');
  const [duration, setDuration] = useState('');
  const [workRequirements, setWorkRequirements] = useState('');
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      clearError();
    }
  }, [error, clearError]);

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!title.trim()) {
      newErrors.title = '请输入标题';
    }
    if (!date) {
      newErrors.date = '请选择拍摄日期';
    }
    if (!city.trim()) {
      newErrors.city = '请输入城市';
    }
    if (selectedStyles.length === 0) {
      newErrors.style = '请至少选择一种拍摄风格';
    }
    if (feeType === 'paid' && (!fee || parseInt(fee) <= 0)) {
      newErrors.fee = '请输入有效费用';
    }
    if (!contact.trim()) {
      newErrors.contact = '请输入联系方式';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!validate()) {
      return;
    }

    try {
      await createSchedule({
        title: title.trim(),
        city: city.trim(),
        date,
        style: selectedStyles,
        fee: feeType === 'paid' ? parseInt(fee) : 0,
        feeType,
        feeNote: feeNote.trim() || undefined,
        duration: duration.trim() || undefined,
        workRequirements: workRequirements.trim() || undefined,
        contact: contact.trim(),
        description: description.trim(),
        samplePhotos: []
      });
      navigate('/schedule');
    } catch (err) {
      // Error is handled by store
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 mb-4">
              <Plus className="w-8 h-8 text-gold-500" />
            </div>
            <h1 className="font-display text-3xl font-bold gold-text-gradient mb-2">
              发布档期
            </h1>
            <p className="text-cream-400">填写拍摄信息，寻找合适的合作伙伴</p>
          </div>

          <div className="card p-8 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-6">
              {localError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {localError}
                </div>
              )}

              <div>
                <label className="form-label flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gold-500" />
                  <span>标题 <span className="text-red-400">*</span></span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="如：周末街拍约拍、古风创作等"
                />
                {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gold-500" />
                    <span>拍摄日期 <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={getTodayDate()}
                    className={`input-field ${errors.date ? 'border-red-500' : ''}`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date}</p>}
                </div>

                <div>
                  <label className="form-label flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gold-500" />
                    <span>城市 <span className="text-red-400">*</span></span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={`input-field ${errors.city ? 'border-red-500' : ''}`}
                    placeholder="如：北京市朝阳区"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
                </div>
              </div>

              <div>
                <label className="form-label flex items-center space-x-2">
                  <Tags className="w-4 h-4 text-gold-500" />
                  <span>拍摄风格 <span className="text-red-400">*</span></span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleStyle(style)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedStyles.includes(style)
                          ? 'bg-gold-500 text-charcoal-900'
                          : 'bg-charcoal-700 text-cream-400 border border-charcoal-600 hover:border-gold-500/50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                {errors.style && <p className="mt-2 text-sm text-red-400">{errors.style}</p>}
              </div>

              <div>
                <label className="form-label flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gold-500" />
                  <span>费用类型 <span className="text-red-400">*</span></span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FEE_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFeeType(option.value as 'free' | 'paid' | 'negotiable')}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        feeType === option.value
                          ? 'bg-gold-500 text-charcoal-900'
                          : 'bg-charcoal-700 text-cream-400 border border-charcoal-600 hover:border-gold-500/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {feeType === 'paid' && (
                <div>
                  <label className="form-label">费用金额（元） <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    min="0"
                    className={`input-field ${errors.fee ? 'border-red-500' : ''}`}
                    placeholder="请输入费用金额"
                  />
                  {errors.fee && <p className="mt-1 text-sm text-red-400">{errors.fee}</p>}
                </div>
              )}

              <div>
                <label className="form-label">费用说明</label>
                <textarea
                  value={feeNote}
                  onChange={(e) => setFeeNote(e.target.value)}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="费用包含内容、是否需要报销路费等"
                />
              </div>

              <div>
                <label className="form-label flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gold-500" />
                  <span>拍摄时长</span>
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-field"
                  placeholder="如：2-3小时、半天、全天"
                />
              </div>

              <div>
                <label className="form-label">作品要求</label>
                <textarea
                  value={workRequirements}
                  onChange={(e) => setWorkRequirements(e.target.value)}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="对模特/摄影师的具体要求、拍摄主题、服装道具等"
                />
              </div>

              <div>
                <label className="form-label flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gold-500" />
                  <span>联系方式 <span className="text-red-400">*</span></span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className={`input-field ${errors.contact ? 'border-red-500' : ''}`}
                  placeholder="微信号/手机号，方便对方联系你"
                />
                {errors.contact && <p className="mt-1 text-sm text-red-400">{errors.contact}</p>}
              </div>

              <div>
                <label className="form-label">备注</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field min-h-[100px] resize-none"
                  placeholder="其他需要说明的事项"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>发布中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>发布档期</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
