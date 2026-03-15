import { setCookie, getCookie, deleteCookie } from '../utils/cookies'

import { API_BASE_URL } from '../config'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface LoginResponse {
    token: string
    username: string
    role: string
    expiresAt: string
}

export interface Session {
    token: string
    username: string
    role: string
    expiresAt: string
}

// ─── Cookie names ─────────────────────────────────────────────────────────────
const COOKIE_TOKEN = 'auth_token'
const COOKIE_USERNAME = 'username'
const COOKIE_ROLE = 'role'
const COOKIE_EXPIRES_AT = 'expiresAt'

// ─── Auth service ─────────────────────────────────────────────────────────────

/**
 * Sends credentials to the API and stores the returned session in cookies.
 * @throws Error with a user-friendly message on failure.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            accept: 'text/plain',
        },
        body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
        // Try to extract a message from the response body
        let message = 'Invalid email or password.'
        try {
            const body = await response.json()
            if (body?.message) message = body.message
        } catch {
            // ignore parse errors
        }
        throw new Error(message)
    }

    const data: LoginResponse = await response.json()

    // Persist session in cookies (expire at the server-defined time)
    setCookie(COOKIE_TOKEN, data.token, data.expiresAt)
    setCookie(COOKIE_USERNAME, data.username, data.expiresAt)
    setCookie(COOKIE_ROLE, data.role, data.expiresAt)
    setCookie(COOKIE_EXPIRES_AT, data.expiresAt, data.expiresAt)

    return data
}

/**
 * Clears all session cookies, effectively logging the user out.
 */
export function logout(): void {
    deleteCookie(COOKIE_TOKEN)
    deleteCookie(COOKIE_USERNAME)
    deleteCookie(COOKIE_ROLE)
    deleteCookie(COOKIE_EXPIRES_AT)
}

/**
 * Returns the current session from cookies, or null if there is no valid session.
 * A session is considered valid if the token exists and has not expired.
 */
export function getSession(): Session | null {
    const token = getCookie(COOKIE_TOKEN)
    const username = getCookie(COOKIE_USERNAME)
    const role = getCookie(COOKIE_ROLE)
    const expiresAt = getCookie(COOKIE_EXPIRES_AT)

    if (!token || !username || !role || !expiresAt) return null

    // Check expiry
    if (new Date(expiresAt) <= new Date()) {
        logout() // clean up stale cookies
        return null
    }

    return { token, username, role, expiresAt }
}

/**
 * Returns true if there is a currently valid session.
 */
export function isAuthenticated(): boolean {
    return getSession() !== null
}
