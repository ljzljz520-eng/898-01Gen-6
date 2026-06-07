import { create } from 'zustand';
import { User, Schedule, ShootingPlan, Work, AuthResponse, LoginRequest, RegisterRequest, CancelShootingRequest } from '../../shared/types.js';
import { api } from '../services/api.js';

interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  schedules: Schedule[];
  shootingPlans: ShootingPlan[];
  shootings: ShootingPlan[];
  works: Work[];
  publicWorks: Work[];
  
  getUserById: (id: number) => Promise<User | null>;
  
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  
  fetchSchedules: (filters?: any) => Promise<void>;
  fetchShootingPlans: () => Promise<void>;
  fetchShootings: () => Promise<void>;
  fetchWorks: (filters?: any) => Promise<void>;
  fetchPublicWorks: () => Promise<void>;
  createSchedule: (data: any) => Promise<Schedule>;
  uploadWork: (data: any) => Promise<Work>;
  authorizeWork: (id: number, data: any) => Promise<Work>;
  deleteWork: (id: number) => Promise<void>;
  
  createShootingPlan: (data: any) => Promise<ShootingPlan>;
  confirmShootingPlan: (id: number) => Promise<void>;
  rejectShootingPlan: (id: number) => Promise<void>;
  completeShootingPlan: (id: number) => Promise<void>;
  cancelShootingPlan: (id: number, data: CancelShootingRequest) => Promise<void>;
  
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  
  schedules: [],
  shootingPlans: [],
  shootings: [],
  works: [],
  publicWorks: [],
  
  getUserById: async (id: number) => {
    try {
      const user = await api.users.getUserById(id);
      return user;
    } catch (error: any) {
      set({ error: error.message });
      return null;
    }
  },
  
  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await api.auth.login(data);
      localStorage.setItem('token', response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response: AuthResponse = await api.auth.register(data);
      localStorage.setItem('token', response.token);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      schedules: [],
      shootingPlans: [],
      works: []
    });
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }
    
    try {
      const user = await api.auth.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('token');
      set({ isAuthenticated: false, user: null, token: null });
    }
  },
  
  fetchSchedules: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const schedules = await api.schedules.getSchedules(filters);
      set({ schedules, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchShootingPlans: async () => {
    set({ isLoading: true, error: null });
    try {
      const shootingPlans = await api.shootings.getShootingPlans();
      set({ shootingPlans, shootings: shootingPlans, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchShootings: async () => {
    set({ isLoading: true, error: null });
    try {
      const shootingPlans = await api.shootings.getShootingPlans();
      set({ shootingPlans, shootings: shootingPlans, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchWorks: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const works = await api.works.getWorks(filters);
      set({ works, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  fetchPublicWorks: async () => {
    set({ isLoading: true, error: null });
    try {
      const publicWorks = await api.works.getWorks({ public: true });
      set({ publicWorks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createSchedule: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const schedule = await api.schedules.createSchedule(data);
      set({ isLoading: false });
      return schedule;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  createShootingPlan: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const shootingPlan = await api.shootings.createShootingPlan(data);
      const shootingPlans = await api.shootings.getShootingPlans();
      set({ shootingPlans, shootings: shootingPlans, isLoading: false });
      return shootingPlan;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  uploadWork: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const work = await api.works.uploadWork(data);
      const works = await api.works.getWorks();
      set({ works, isLoading: false });
      return work;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  authorizeWork: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const work = await api.works.authorizeWork(id, data);
      const works = await api.works.getWorks();
      const publicWorks = await api.works.getWorks({ public: true });
      set({ works, publicWorks, isLoading: false });
      return work;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteWork: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.works.deleteWork(id);
      const works = await api.works.getWorks();
      const publicWorks = await api.works.getWorks({ public: true });
      set({ works, publicWorks, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  confirmShootingPlan: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.shootings.confirmShootingPlan(id);
      const shootingPlans = await api.shootings.getShootingPlans();
      set({ shootingPlans, shootings: shootingPlans, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  rejectShootingPlan: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.shootings.rejectShootingPlan(id);
      const shootingPlans = await api.shootings.getShootingPlans();
      set({ shootingPlans, shootings: shootingPlans, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  completeShootingPlan: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.shootings.completeShootingPlan(id);
      const shootingPlans = await api.shootings.getShootingPlans();
      set({ shootingPlans, shootings: shootingPlans, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  cancelShootingPlan: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await api.shootings.cancelShootingPlan(id, data);
      const shootingPlans = await api.shootings.getShootingPlans();
      set({ shootingPlans, shootings: shootingPlans, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  
  clearError: () => set({ error: null })
}));
