import { NextRequest, NextResponse } from 'next/server'
import { createSession, COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check super admin (env-based credentials)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

    if (email === adminUsername && password === adminPassword) {
      const token = await createSession(adminUsername, 'admin')
      const response = NextResponse.json({ success: true, role: 'admin' })
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })
      return response
    }

    // Check database users
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const passwordValid = await bcrypt.compare(password, user.password)
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (user.status === 'pending') {
      return NextResponse.json(
        { error: 'Your account is pending approval. Please wait for admin activation.' },
        { status: 403 }
      )
    }

    if (user.status === 'rejected') {
      return NextResponse.json(
        { error: 'Your account has been rejected. Contact support for more info.' },
        { status: 403 }
      )
    }

    const token = await createSession(user.email, user.role)
    const response = NextResponse.json({ success: true, role: user.role })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
