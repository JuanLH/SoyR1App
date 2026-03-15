import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { login } from '../services/authService'

interface LoginPageProps {
    onLoginSuccess: () => void
    onBackToLanding: () => void
}

interface FormErrors {
    email?: string
    password?: string
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
    const { t } = useTranslation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<FormErrors>({})
    const [apiError, setApiError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // ── Validation ──────────────────────────────────────────────────────────────
    const validate = (): boolean => {
        const newErrors: FormErrors = {}

        if (!email.trim()) {
            newErrors.email = t('login.errors.emailRequired')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = t('login.errors.emailInvalid')
        }

        if (!password) {
            newErrors.password = t('login.errors.passwordRequired')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // ── Submit ──────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setApiError(null)

        if (!validate()) return

        setIsLoading(true)
        try {
            await login(email, password)
            onLoginSuccess()
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
            setApiError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden px-4">
            {/* Ambient orbs */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-5%] left-[-5%] w-72 h-72 bg-violet-600 opacity-20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10">

                    {/* Logo / Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-3xl">🎓</span>
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-extrabold text-white text-center mb-1">{t('login.title')}</h2>
                    <p className="text-slate-400 text-sm text-center mb-8">{t('login.subtitle')}</p>

                    {/* API error banner */}
                    {apiError && (
                        <div
                            id="login-error-banner"
                            role="alert"
                            className="mb-6 flex items-start gap-3 px-4 py-3 rounded-xl
                         bg-red-500/15 border border-red-500/30 text-red-300 text-sm"
                        >
                            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {apiError}
                        </div>
                    )}

                    {/* Form */}
                    <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-5">

                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                                {t('login.emailLabel')}
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })) }}
                                placeholder={t('login.emailPlaceholder')}
                                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-500
                            focus:outline-none focus:ring-2 transition-colors
                            ${errors.email
                                        ? 'border-red-500/60 focus:ring-red-500/40'
                                        : 'border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/30'
                                    }`}
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                                {t('login.passwordLabel')}
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })) }}
                                    placeholder={t('login.passwordPlaceholder')}
                                    className={`w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border text-white placeholder-slate-500
                              focus:outline-none focus:ring-2 transition-colors
                              ${errors.password
                                            ? 'border-red-500/60 focus:ring-red-500/40'
                                            : 'border-white/10 focus:border-indigo-500/60 focus:ring-indigo-500/30'
                                        }`}
                                />
                                {/* Show/hide toggle */}
                                <button
                                    type="button"
                                    id="toggle-password-visibility"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit-btn"
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl font-bold text-white
                         bg-gradient-to-r from-indigo-500 to-violet-600
                         hover:from-indigo-400 hover:to-violet-500
                         disabled:opacity-60 disabled:cursor-not-allowed
                         active:scale-[0.98] transition-all duration-200 ease-out
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900
                         flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/25"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    {t('login.buttonLoading')}
                                </>
                            ) : (
                                t('login.button')
                            )}
                        </button>
                    </form>

                    {/* Back link */}
                    <div className="mt-6 text-center">
                        <button
                            id="back-to-landing-btn"
                            onClick={onBackToLanding}
                            className="text-sm text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-2"
                        >
                            {t('login.backToHome')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default LoginPage
