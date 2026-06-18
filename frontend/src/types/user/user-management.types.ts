export type Role = 'Admin' | 'Learner' | 'Academic Manager' | 'Course Provider';
export type Status = 'Active' | 'Inactive';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  joined: string;
  avatar: string;
  avatarColor: string;
  lastSeen: string;
  updatedAt?: string;
}
