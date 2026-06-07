export interface User {
  id: number;
  username: string;
  avatar: string;
  role: 'photographer' | 'model';
  realName: string;
  phone: string;
  city: string;
  styles: string[];
  bio: string;
  creditScore: number;
  samplePhotos: string[];
  createdAt: string;
}

export interface Schedule {
  id: number;
  userId: number;
  user?: User;
  title: string;
  city: string;
  date: string;
  style: string[];
  fee: number;
  feeType: 'free' | 'paid' | 'negotiable';
  feeNote?: string;
  duration?: string;
  workRequirements?: string;
  contact?: string;
  description: string;
  samplePhotos: string[];
  status: 'active' | 'booked' | 'expired';
  createdAt: string;
}

export interface ShootingPlan {
  id: number;
  scheduleId: number | null;
  schedule?: Schedule | null;
  requesterId: number;
  requester?: User;
  recipientId: number;
  recipient?: User;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  shootingDate: string;
  shootingLocation: string;
  notes: string;
  createdAt: string;
  confirmedAt: string | null;
}

export interface CancellationRecord {
  id: number;
  shootingPlanId: number;
  userId: number;
  user?: User;
  reason: string;
  hoursBeforeShooting: number;
  creditDeducted: number;
  createdAt: string;
}

export interface Work {
  id: number;
  shootingPlanId: number | null;
  shootingPlan?: ShootingPlan | null;
  uploaderId: number;
  uploader?: User;
  photographerId?: number;
  modelId?: number;
  title: string;
  description: string;
  imageUrl: string;
  visibility: 'private' | 'both' | 'public';
  photographerConfirmed: boolean;
  modelConfirmed: boolean;
  createdAt: string;
}

export interface Authorization {
  id: number;
  workId: number;
  userId: number;
  visibility: 'private' | 'both' | 'public';
  confirmed: boolean;
  confirmedAt: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  realName: string;
  phone: string;
  role: 'photographer' | 'model';
  city: string;
}

export interface CreateScheduleRequest {
  title: string;
  city: string;
  date: string;
  style: string[];
  fee: number;
  feeType: 'free' | 'paid' | 'negotiable';
  feeNote?: string;
  duration?: string;
  workRequirements?: string;
  contact?: string;
  description: string;
  samplePhotos: string[];
}

export interface CreateShootingPlanRequest {
  scheduleId?: number;
  recipientId: number;
  shootingDate: string;
  shootingLocation: string;
  notes: string;
}

export interface CancelShootingRequest {
  reason: string;
}

export interface UploadWorkRequest {
  shootingPlanId?: number;
  title: string;
  description: string;
  visibility: 'private' | 'both' | 'public';
}

export interface AuthorizeWorkRequest {
  visibility: 'private' | 'both' | 'public';
}
