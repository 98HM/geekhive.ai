import { auth } from './index'
import { redirect } from 'next/navigation'
import { UserRole } from '@prisma/client'

/**
 * Get current user with role
 */
export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user) return null
  return session.user
}

/**
 * Require authentication
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

/**
 * Require specific role
 */
export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]
  
  if (!roles.includes(user.role as UserRole)) {
    redirect('/unauthorized')
  }
  return user
}

/**
 * Require admin
 */
export async function requireAdmin() {
  return requireRole('ADMIN')
}

/**
 * Require vendor or admin
 */
export async function requireVendorOrAdmin() {
  return requireRole(['VENDOR', 'ADMIN'])
}


