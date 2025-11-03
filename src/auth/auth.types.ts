export type Role = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'

export interface AuthUser {
  sub: string
  email: string
  garage: { id: string; role: Role }
}
