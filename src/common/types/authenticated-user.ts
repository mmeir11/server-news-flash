export type UserRole = 'reader' | 'publisher' | 'moderator' | 'editor' | 'admin';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  roles: UserRole[];
}