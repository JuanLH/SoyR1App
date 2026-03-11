import React from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMIZATION — edit these two constants to change the landing page text.
// ─────────────────────────────────────────────────────────────────────────────
const APP_TITLE = 'Welcome to SoyR1App'
const APP_DESCRIPTION =
    'Your all-in-one platform for ENURM exam preparation. Practice with real exam questions, track your progress, and boost your confidence before the big day.'
// ─────────────────────────────────────────────────────────────────────────────

interface LandingPageProps {
    onNavigateToLogin: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
            {/* Ambient background orbs */}
            <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-violet-600 opacity-20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-10 md:gap-16">

                {/* ── Left column — IMAGE PLACEHOLDER ───────────────────────────────── */}
                {/*
          REPLACE_WITH_IMAGE:
          Replace the <div> below with an <img> element pointing to your image.
          Example:
            <img
              src="/your-image.png"
              alt="App preview"
              className="w-full max-w-md rounded-2xl shadow-2xl object-cover"
            />
        */}
                <div className="flex-1 flex items-center justify-center">
                    <div
                        className="w-full max-w-md aspect-[4/3] rounded-2xl border-2 border-dashed border-indigo-500/40
                       bg-white/5 backdrop-blur-sm flex flex-col items-center justify-center gap-3
                       text-indigo-300/60 select-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-16 h-16 opacity-50"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
                        </svg>
                        <span className="text-sm font-medium tracking-wide uppercase">Image goes here</span>
                        <span className="text-xs opacity-60">Replace this placeholder with your image</span>
                    </div>
                </div>

                {/* ── Right column — CTA ─────────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col items-start gap-6">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                           bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 tracking-widest uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Exam Platform
                    </span>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                        {APP_TITLE}
                    </h1>

                    {/* Description */}
                    <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                        {APP_DESCRIPTION}
                    </p>

                    {/* Login button */}
                    <button
                        id="landing-login-btn"
                        onClick={onNavigateToLogin}
                        className="mt-2 inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-bold
                       bg-gradient-to-r from-indigo-500 to-violet-600
                       text-white shadow-lg shadow-indigo-500/30
                       hover:from-indigo-400 hover:to-violet-500
                       active:scale-95
                       transition-all duration-200 ease-out
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                        </svg>
                        Login to Continue
                    </button>
                </div>

            </div>
        </div>
    )
}

export default LandingPage
