import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Upload, Eye, Lock, Users, Check, X, Trash2, ImagePlus } from 'lucide-react';
import { useStore } from '../store/useStore.js';
import { Work, ShootingPlan, AuthorizeWorkRequest, UploadWorkRequest } from '../../shared/types.js';
import WorkCard from '../components/WorkCard.js';
import Modal from '../components/Modal.js';

type TabType = 'my' | 'pending' | 'public';

const VISIBILITY_OPTIONS = [
  { value: 'private', label: '私有', icon: Lock, color: 'text-red-400 bg-red-500/20', border: 'border-red-500/50' },
  { value: 'both', label: '双方可见', icon: Users, color: 'text-blue-400 bg-blue-500/20', border: 'border-blue-500/50' },
  { value: 'public', label: '公开', icon: Eye, color: 'text-green-400 bg-green-500/20', border: 'border-green-500/50' },
] as const;

export default function Works() {
  const { user, works, publicWorks, isLoading, fetchWorks, fetchPublicWorks, fetchShootingPlans, shootingPlans, uploadWork, authorizeWork, deleteWork } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAuthorizeModal, setShowAuthorizeModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [authorizeVisibility, setAuthorizeVisibility] = useState<'private' | 'both' | 'public'>('both');
  const [workToDelete, setWorkToDelete] = useState<Work | null>(null);
  const [workToAuthorize, setWorkToAuthorize] = useState<Work | null>(null);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    shootingPlanId: '',
    visibility: 'private' as 'private' | 'both' | 'public',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWorks();
    fetchPublicWorks();
    fetchShootingPlans();
  }, [fetchWorks, fetchPublicWorks, fetchShootingPlans]);

  const myWorks = useMemo(() => {
    if (!user) return [];
    return works.filter((work) => work.uploaderId === user.id);
  }, [works, user]);

  const pendingWorks = useMemo(() => {
    if (!user) return [];
    return works.filter((work) => {
      const isPhotographer = user.role === 'photographer';
      const isModel = user.role === 'model';
      
      if (isPhotographer && work.photographerId === user.id && !work.photographerConfirmed) {
        return true;
      }
      if (isModel && work.modelId === user.id && !work.modelConfirmed) {
        return true;
      }
      return false;
    });
  }, [works, user]);

  const confirmedPublicWorks = useMemo(() => {
    return publicWorks.filter(
      (work) => work.visibility === 'public' && work.photographerConfirmed && work.modelConfirmed
    );
  }, [publicWorks]);

  const currentWorks = useMemo(() => {
    switch (activeTab) {
      case 'my':
        return myWorks;
      case 'pending':
        return pendingWorks;
      case 'public':
        return confirmedPublicWorks;
      default:
        return [];
    }
  }, [activeTab, myWorks, pendingWorks, confirmedPublicWorks]);

  const handleViewWork = useCallback((work: Work) => {
    setSelectedWork(work);
    setShowDetailModal(true);
  }, []);

  const handleAuthorize = useCallback((work: Work) => {
    setWorkToAuthorize(work);
    setAuthorizeVisibility('both');
    setShowAuthorizeModal(true);
  }, []);

  const handleConfirmAuthorize = useCallback(async () => {
    if (!workToAuthorize) return;
    
    const data: AuthorizeWorkRequest = { visibility: authorizeVisibility };
    await authorizeWork(workToAuthorize.id, data);
    setShowAuthorizeModal(false);
    setWorkToAuthorize(null);
  }, [workToAuthorize, authorizeVisibility, authorizeWork]);

  const handleDeleteClick = useCallback((work: Work, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkToDelete(work);
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!workToDelete) return;
    await deleteWork(workToDelete.id);
    setShowDeleteConfirm(false);
    setShowDetailModal(false);
    setWorkToDelete(null);
    setSelectedWork(null);
  }, [workToDelete, deleteWork]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const handleUploadSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const data: UploadWorkRequest & { image: File } = {
      title: uploadForm.title,
      description: uploadForm.description,
      visibility: uploadForm.visibility,
      image: selectedFile,
    };

    if (uploadForm.shootingPlanId) {
      (data as any).shootingPlanId = parseInt(uploadForm.shootingPlanId);
    }

    await uploadWork(data);
    setShowUploadModal(false);
    setUploadForm({
      title: '',
      description: '',
      shootingPlanId: '',
      visibility: 'private',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedFile, uploadForm, uploadWork]);

  const handleUploadModalClose = useCallback(() => {
    setShowUploadModal(false);
    setUploadForm({
      title: '',
      description: '',
      shootingPlanId: '',
      visibility: 'private',
    });
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const visibilityConfig = (visibility: string) => {
    return VISIBILITY_OPTIONS.find((v) => v.value === visibility) || VISIBILITY_OPTIONS[0];
  };

  const isUploader = selectedWork && user && selectedWork.uploaderId === user.id;

  const availableShootingPlans = useMemo(() => {
    return shootingPlans.filter(
      (plan) => plan.status === 'confirmed' || plan.status === 'completed'
    );
  }, [shootingPlans]);

  const renderEmptyState = (title: string, description: string, icon: React.ReactNode) => (
    <div className="card p-12 text-center">
      <div className="w-20 h-20 mx-auto mb-4 bg-charcoal-700 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-cream-200 mb-2">{title}</h3>
      <p className="text-cream-500">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-cream-100 font-display">
              作品<span className="gold-text-gradient">管理</span>
            </h1>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              上传作品
            </button>
          </div>
          <p className="text-cream-500">管理您的摄影作品，查看授权状态</p>
        </div>

        <div className="bg-charcoal-800/50 backdrop-blur-sm border border-charcoal-700 rounded-xl p-1 mb-8">
          <div className="flex gap-1">
            {[
              { key: 'my', label: '我的作品', count: myWorks.length },
              { key: 'pending', label: '待我授权', count: pendingWorks.length },
              { key: 'public', label: '公开作品', count: confirmedPublicWorks.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-300 relative ${
                  activeTab === tab.key
                    ? 'bg-gold-500 text-charcoal-900 shadow-gold-glow'
                    : 'text-cream-400 hover:text-gold-400'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.key
                        ? 'bg-charcoal-900/30 text-charcoal-900'
                        : 'bg-charcoal-700 text-cream-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[3/4] bg-charcoal-700" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-charcoal-700 rounded w-3/4" />
                  <div className="h-3 bg-charcoal-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : currentWorks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentWorks.map((work) => (
              <div key={work.id} className="relative">
                <WorkCard
                  work={work}
                  onView={handleViewWork}
                  onAuthorize={activeTab === 'pending' ? handleAuthorize : undefined}
                />
                {user && work.uploaderId === user.id && activeTab === 'my' && (
                  <button
                    onClick={(e) => handleDeleteClick(work, e)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition-colors z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {activeTab === 'my' &&
              renderEmptyState(
                '暂无作品',
                '您还没有上传任何作品，点击右上角上传您的第一个作品吧',
                <ImagePlus className="w-10 h-10 text-charcoal-500" />
              )}
            {activeTab === 'pending' &&
              renderEmptyState(
                '暂无待授权作品',
                '您没有需要授权的作品',
                <Check className="w-10 h-10 text-charcoal-500" />
              )}
            {activeTab === 'public' &&
              renderEmptyState(
                '暂无公开作品',
                '目前还没有公开的作品',
                <Eye className="w-10 h-10 text-charcoal-500" />
              )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showDetailModal && !!selectedWork}
        onClose={() => setShowDetailModal(false)}
        title="作品详情"
        size="lg"
      >
        {selectedWork && (
          <div className="space-y-6">
            <div className="relative aspect-video bg-charcoal-700 rounded-xl overflow-hidden">
              <img
                src={selectedWork.imageUrl.startsWith('http') ? selectedWork.imageUrl : `http://localhost:3001${selectedWork.imageUrl}`}
                alt={selectedWork.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-cream-100 mb-1">
                    {selectedWork.title}
                  </h3>
                  <p className="text-cream-500 text-sm">
                    上传于 {new Date(selectedWork.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs ${
                    visibilityConfig(selectedWork.visibility).color
                  }`}
                >
                  {(() => {
                  const VisIcon = visibilityConfig(selectedWork.visibility).icon;
                  return <VisIcon className="w-4 h-4" />;
                })()}
                  <span>{visibilityConfig(selectedWork.visibility).label}</span>
                </span>
              </div>

              <p className="text-cream-300 mb-4">{selectedWork.description}</p>

              <div className="bg-charcoal-700/50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-cream-400 mb-3">双方确认状态</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedWork.uploader?.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20avatar&image_size=square'}
                      alt={selectedWork.uploader?.realName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-cream-200">
                        {selectedWork.uploader?.realName}
                      </p>
                      <p className="text-xs text-cream-500">上传者</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedWork.photographerConfirmed ? (
                      <span className="flex items-center text-green-400 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        摄影师已确认
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-400 text-sm">
                        <X className="w-4 h-4 mr-1" />
                        摄影师待确认
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedWork.modelConfirmed ? (
                      <span className="flex items-center text-green-400 text-sm">
                        <Check className="w-4 h-4 mr-1" />
                        模特已确认
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-400 text-sm">
                        <X className="w-4 h-4 mr-1" />
                        模特待确认
                      </span>
                    )}
                  </div>
                </div>
                {isUploader && (
                  <div className="mt-4 pt-4 border-t border-charcoal-600">
                    <button
                      onClick={() => {
                        setWorkToDelete(selectedWork);
                        setShowDeleteConfirm(true);
                      }}
                      className="btn-danger w-full flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除作品
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showAuthorizeModal && !!workToAuthorize}
        onClose={() => {
          setShowAuthorizeModal(false);
          setWorkToAuthorize(null);
        }}
        title="授权作品"
        size="md"
      >
        {workToAuthorize && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-24 bg-charcoal-700 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={workToAuthorize.imageUrl.startsWith('http') ? workToAuthorize.imageUrl : `http://localhost:3001${workToAuthorize.imageUrl}`}
                  alt={workToAuthorize.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium text-cream-100 mb-1">
                  {workToAuthorize.title}
                </h4>
                <p className="text-sm text-cream-500 line-clamp-2">
                  {workToAuthorize.description}
                </p>
              </div>
            </div>

            <div>
              <label className="form-label">选择可见范围</label>
              <div className="grid grid-cols-3 gap-3">
                {VISIBILITY_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setAuthorizeVisibility(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                        authorizeVisibility === option.value
                          ? option.color + ' ' + option.border
                          : 'border-charcoal-600 bg-charcoal-700/50 hover:border-charcoal-500'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
              onClick={() => {
                setShowAuthorizeModal(false);
                setWorkToAuthorize(null);
              }}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
              <button
                onClick={handleConfirmAuthorize}
                className="flex-1 btn-primary"
              >
                确认授权
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showUploadModal}
        onClose={handleUploadModalClose}
        title="上传作品"
        size="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div>
            <label className="form-label">选择图片</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-charcoal-600 rounded-xl p-8 text-center cursor-pointer hover:border-gold-500/50 transition-colors"
            >
              {previewUrl ? (
                <div className="relative aspect-video bg-charcoal-700 rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <ImagePlus className="w-12 h-12 mx-auto text-charcoal-500" />
                  <p className="text-cream-400">点击或拖拽上传图片</p>
                  <p className="text-sm text-charcoal-500">支持 JPG、PNG、GIF 格式</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="form-label">标题</label>
            <input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              placeholder="请输入作品标题"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="form-label">描述</label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              placeholder="请输入作品描述"
              className="input-field min-h-[100px]"
              rows={4}
            />
          </div>

          <div>
            <label className="form-label">关联拍摄计划（可选）</label>
            <select
              value={uploadForm.shootingPlanId}
              onChange={(e) => setUploadForm({ ...uploadForm, shootingPlanId: e.target.value })}
              className="input-field"
            >
              <option value="">不关联</option>
              {availableShootingPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.schedule?.title || `拍摄计划 #${plan.id}`} - {new Date(plan.shootingDate).toLocaleDateString('zh-CN')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">可见范围</label>
            <div className="grid grid-cols-3 gap-3">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUploadForm({ ...uploadForm, visibility: option.value })}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                      uploadForm.visibility === option.value
                        ? option.color + ' ' + option.border
                        : 'border-charcoal-600 bg-charcoal-700/50 hover:border-charcoal-500'
                    }`}
                  >
                    <Icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleUploadModalClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!selectedFile || !uploadForm.title}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              提交上传
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm && !!workToDelete}
        onClose={() => {
          setShowDeleteConfirm(false);
          setWorkToDelete(null);
        }}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-cream-100 mb-2">
              确定要删除这个作品吗？
            </h3>
            <p className="text-cream-500">
              此操作不可撤销，删除后将无法恢复。
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setWorkToDelete(null);
              }}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 btn-danger"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
