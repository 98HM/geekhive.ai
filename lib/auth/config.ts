import { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Store user info in JWT token
      if (user) {
        token.id = user.id
        // Get role from database if available (Node.js runtime only)
        if (typeof EdgeRuntime === 'undefined' && user.id) {
          try {
            const { prisma } = await import('@/lib/db/prisma')
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { role: true },
            })
            token.role = dbUser?.role || 'USER'
          } catch (error) {
            token.role = 'USER'
          }
        } else {
          token.role = (user as any).role || 'USER'
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = (token.role as any) || 'USER'
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Skip DB operations in Edge runtime
      if (typeof EdgeRuntime !== 'undefined') {
        return true
      }
      // On first sign in, create user with default role
      if (account?.provider === 'google' && user.email) {
        try {
          const { prisma } = await import('@/lib/db/prisma')
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          })
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                role: 'USER',
              },
            })
          }
        } catch (error) {
          console.error('Error creating user:', error)
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt', // Use JWT for Edge compatibility
  },
}

