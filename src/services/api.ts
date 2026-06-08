import {
  User,
  Schedule,
  ShootingPlan,
  Work,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CreateScheduleRequest,
  CreateShootingPlanRequest,
  CancelShootingRequest,
  UploadWorkRequest,
  AuthorizeWorkRequest,
  CancellationRecord
} from '../../shared/types.js';

const API_BASE = 'http://localhost:3001/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit & { skipJson?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {})
  };
  
  if (!options.skipJson) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '请求失败' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (data: LoginRequest): Promise<AuthResponse> =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    register: (data: RegisterRequest): Promise<AuthResponse> =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    getCurrentUser: (): Promise<User> =>
      request('/auth/me')
  },

  users: {
    getUsers: (filters?: { city?: string; role?: string; style?: string }): Promise<User[]> => {
      const params = new URLSearchParams();
      if (filters?.city) params.append('city', filters.city);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.style) params.append('style', filters.style);
      return request(`/users?${params.toString()}`);
    },

    getUserById: (id: number): Promise<User> =>
      request(`/users/${id}`),

    updateProfile: (data: Partial<User> & { password?: string; oldPassword?: string }): Promise<User> =>
      request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    getCancellationRecords: (): Promise<CancellationRecord[]> =>
      request('/users/cancellations')
  },

  schedules: {
    getSchedules: (filters?: { city?: string; style?: string; userId?: number; status?: string }): Promise<Schedule[]> => {
      const params = new URLSearchParams();
      if (filters?.city) params.append('city', filters.city);
      if (filters?.style) params.append('style', filters.style);
      if (filters?.userId) params.append('userId', filters.userId.toString());
      if (filters?.status) params.append('status', filters.status);
      return request(`/schedules?${params.toString()}`);
    },

    getScheduleById: (id: number): Promise<Schedule> =>
      request(`/schedules/${id}`),

    createSchedule: (data: CreateScheduleRequest & { samplePhotos?: File[] }): Promise<Schedule> => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('city', data.city);
      formData.append('date', data.date);
      formData.append('style', JSON.stringify(data.style));
      formData.append('feeType', data.feeType || 'negotiable');
      formData.append('fee', (data.fee || 0).toString());
      if (data.feeNote) formData.append('feeNote', data.feeNote);
      if (data.duration) formData.append('duration', data.duration);
      if (data.workRequirements) formData.append('workRequirements', data.workRequirements);
      formData.append('contact', data.contact);
      formData.append('description', data.description || '');
      
      if (data.samplePhotos && data.samplePhotos.length > 0) {
        data.samplePhotos.forEach(file => {
          formData.append('samplePhotos', file);
        });
      }
      
      return request('/schedules', {
        method: 'POST',
        body: formData,
        skipJson: true
      });
    },

    updateSchedule: (id: number, data: Partial<CreateScheduleRequest> & { samplePhotos?: File[] }): Promise<Schedule> => {
      const formData = new FormData();
      if (data.title !== undefined) formData.append('title', data.title);
      if (data.city !== undefined) formData.append('city', data.city);
      if (data.date !== undefined) formData.append('date', data.date);
      if (data.style !== undefined) formData.append('style', JSON.stringify(data.style));
      if (data.feeType !== undefined) formData.append('feeType', data.feeType);
      if (data.fee !== undefined) formData.append('fee', data.fee.toString());
      if (data.feeNote !== undefined) formData.append('feeNote', data.feeNote);
      if (data.duration !== undefined) formData.append('duration', data.duration);
      if (data.workRequirements !== undefined) formData.append('workRequirements', data.workRequirements);
      if (data.contact !== undefined) formData.append('contact', data.contact);
      if (data.description !== undefined) formData.append('description', data.description);
      
      if (data.samplePhotos && data.samplePhotos.length > 0) {
        data.samplePhotos.forEach(file => {
          formData.append('samplePhotos', file);
        });
      }
      
      return request(`/schedules/${id}`, {
        method: 'PUT',
        body: formData,
        skipJson: true
      });
    },

    deleteSchedule: (id: number): Promise<{ message: string }> =>
      request(`/schedules/${id}`, {
        method: 'DELETE'
      })
  },

  shootings: {
    getShootingPlans: (): Promise<ShootingPlan[]> =>
      request('/shootings'),

    getShootingPlanById: (id: number): Promise<ShootingPlan> =>
      request(`/shootings/${id}`),

    createShootingPlan: (data: CreateShootingPlanRequest): Promise<ShootingPlan> =>
      request('/shootings', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    confirmShootingPlan: (id: number): Promise<ShootingPlan> =>
      request(`/shootings/${id}/confirm`, {
        method: 'POST'
      }),

    rejectShootingPlan: (id: number): Promise<ShootingPlan> =>
      request(`/shootings/${id}/reject`, {
        method: 'POST'
      }),

    completeShootingPlan: (id: number): Promise<ShootingPlan> =>
      request(`/shootings/${id}/complete`, {
        method: 'POST'
      }),

    cancelShootingPlan: (id: number, data: CancelShootingRequest): Promise<ShootingPlan> =>
      request(`/shootings/${id}/cancel`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  works: {
    getWorks: (filters?: { visibility?: string; shootingPlanId?: number; userId?: number; public?: boolean }): Promise<Work[]> => {
      const params = new URLSearchParams();
      if (filters?.visibility) params.append('visibility', filters.visibility);
      if (filters?.shootingPlanId) params.append('shootingPlanId', filters.shootingPlanId.toString());
      if (filters?.userId) params.append('userId', filters.userId.toString());
      if (filters?.public) params.append('public', 'true');
      return request(`/works?${params.toString()}`);
    },

    getWorkById: (id: number): Promise<Work> =>
      request(`/works/${id}`),

    uploadWork: (data: UploadWorkRequest & { image: File }): Promise<Work> => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('visibility', data.visibility);
      if (data.shootingPlanId) formData.append('shootingPlanId', data.shootingPlanId.toString());
      formData.append('image', data.image);

      const headers = getAuthHeader();
      delete headers['Content-Type'];

      return fetch(`${API_BASE}/works`, {
        method: 'POST',
        headers,
        body: formData
      }).then(res => {
        if (!res.ok) throw new Error('上传失败');
        return res.json();
      });
    },

    authorizeWork: (id: number, data: AuthorizeWorkRequest): Promise<Work> =>
      request(`/works/${id}/authorize`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    deleteWork: (id: number): Promise<{ message: string }> =>
      request(`/works/${id}`, {
        method: 'DELETE'
      })
  }
};
