import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
)

const COOKIE_NAME = 'admin_session'
const TOKEN_EXPIRY = '24h'

export async function createSession(username: string, role: string = 'admin'): Promise<string> {
  const token = await new SignJWT({ username, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)

  return token
}

export async function verifySession(): Promise<{ username: string; role: string } | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { username: string; role: string }
  } catch {
    return null
  }
}

export { COOKIE_NAME }
