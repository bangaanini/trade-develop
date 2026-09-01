import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'secret';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed);
}

export function signToken(payload: any) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export interface UserPayload {
  id: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, SECRET) as UserPayload;
  } catch (e) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  const session = verifyToken(token);
  if (!session) return null;

  // Check if user is banned
  const { db } = await import('@/lib/db');
  const { rows } = await db.query("SELECT banned FROM users WHERE id = $1", [session.id]);
  if (rows.length === 0 || rows[0].banned) {
    return null;
  }

  return session;
}

export async function verifyAuth(req: Request): Promise<UserPayload | null> {
  // Try to get token from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  // Try to get token from Cookie header
  const cookieHeader = req.headers.get('Cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const token = cookies['auth_token'];
    if (token) {
      return verifyToken(token);
    }
  }

  return null;
}
