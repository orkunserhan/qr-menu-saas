import { Link } from '@/src/i18n/routing';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations('landing');

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white font-sans selection:bg-white/30">

      {/* Background Gradients & Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/30 blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[150px]"></div>

      {/* Top Navbar */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20 max-w-7xl mx-auto">
        <div className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          BetterQR
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 font-medium tracking-wide">Select Language</span>
          <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden border border-white/10">
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto mt-10">

        <img src="/upload_1.png" alt="BetterQR Logo" className="h-40 w-auto mb-8 animate-fade-in-down drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:invert" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-down" style={{ animationDelay: '0.1s' }}>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-300 tracking-wider uppercase">{t('systemActive')}</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
          {t('title1')} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            {t('title2')}
          </span> {t('title3')}
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 font-medium leading-relaxed">
          {t('description')}
        </p>

        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
          <Link
            href="/admin"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-8 py-4 font-bold text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
          >
            {t('loginBtn')}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>

          <Link
            href="/demo-restaurant"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white/5 border border-white/10 px-8 py-4 font-semibold text-lg hover:bg-white/10 backdrop-blur-md transition-all duration-300"
          >
            {t('demoBtn')}
          </Link>
        </div>
      </main>

      {/* Modern Footer/Credits */}
      <footer className="absolute bottom-6 text-gray-500 text-sm font-medium z-10 w-full text-center">
        © {new Date().getFullYear()} Better Businnes Alle Rechte vorbehalten
      </footer>
    </div>
  );
}
