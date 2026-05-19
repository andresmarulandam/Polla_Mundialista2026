import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase';
import { User, UserSession } from './types';

const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'polla-mundialista-secret-key-2026'
);

const SESSION_DURATION = 60 * 60 * 24 * 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: User): Promise<string> {
  const sessionData = {
    id: user.id,
    name: user.name,
    is_admin: user.is_admin,
  };

  return new SignJWT(sessionData as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_DURATION)
    .sign(SESSION_SECRET);
}

export async function verifySession(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export async function createUser(name: string, password: string): Promise<User | null> {
  const password_hash = await hashPassword(password);

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ name, password_hash })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error.code, error.message, error.details);
    return null;
  }

  return data as User;
}

export async function authenticateUser(
  name: string,
  password: string
): Promise<UserSession | null> {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('name', name)
    .single();

  if (error || !user) {
    return null;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    is_admin: user.is_admin,
  };
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as User;
}