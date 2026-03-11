/**
 * Cookie utility helpers.
 * Used by authService to persist session data.
 */

/**
 * Sets a cookie with an explicit expiry date.
 * @param name   Cookie name
 * @param value  Cookie value (will be URI-encoded)
 * @param expiresAt  ISO-8601 string — the moment the cookie should expire
 */
export function setCookie(name: string, value: string, expiresAt: string): void {
    const expires = new Date(expiresAt).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

/**
 * Reads a cookie by name.
 * @returns The decoded cookie value, or null if not found.
 */
export function getCookie(name: string): string | null {
    const prefix = `${name}=`
    const cookies = document.cookie.split(';')
    for (const raw of cookies) {
        const cookie = raw.trim()
        if (cookie.startsWith(prefix)) {
            return decodeURIComponent(cookie.substring(prefix.length))
        }
    }
    return null
}

/**
 * Deletes a cookie by setting its expiry in the past.
 */
export function deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
}
