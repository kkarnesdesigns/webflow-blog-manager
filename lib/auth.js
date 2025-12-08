// Simple password-based authentication
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'blog_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Simple hash function for session token
function createSessionToken(password) {
  const secret = process.env.SESSION_SECRET || 'default-secret';
  const timestamp = Date.now();
  const data = `${password}-${secret}-${timestamp}`;
  // Simple base64 encoding (for production use, consider crypto)
  return Buffer.from(data).toString('base64');
}

export function validatePassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not configured');
    return false;
  }
  return password === adminPassword;
}

export function createSession(password) {
  if (!validatePassword(password)) {
    return null;
  }
  return {
    token: createSessionToken(password),
    expiresAt: Date.now() + SESSION_DURATION
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.expiresAt < Date.now()) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}

export { SESSION_COOKIE_NAME };
