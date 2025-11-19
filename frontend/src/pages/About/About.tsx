import { Link } from 'react-router-dom'
import AdBanner from '@/components/Ads/AdBanner'
import AdSidebar from '@/components/Ads/AdSidebar'

export default function About() {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner Ad */}
      <AdBanner slot="topBanner" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Hero Section - Enhanced */}
          <div className="relative overflow-hidden card bg-gradient-to-br from-primary-50 via-accent-50 to-primary-100 dark:from-primary-900/30 dark:via-accent-900/30 dark:to-primary-900/40 border-2 border-primary-200 dark:border-primary-800 mb-8 animate-fade-in-up">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow"></div>
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl ring-4 ring-white dark:ring-gray-800 transform group-hover:scale-105 transition-transform duration-300">
                    HS
                  </div>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 dark:from-primary-400 dark:via-accent-400 dark:to-primary-500 mb-3 animate-gradient">
                  Hesham Sayed
                </h1>
                <p className="text-2xl text-primary-600 dark:text-primary-400 font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Senior Software Engineer
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                  Building innovative solutions that empower developers worldwide
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Full Stack Development
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Python & Django
                  </span>
                  <span className="px-4 py-2 bg-gradient-to-r from-success-500 to-success-600 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    React & TypeScript
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="card mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              About the Developer
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome! I'm Hesham Sayed, a passionate Senior Software Engineer with extensive experience in building robust, scalable web applications. I created DevTools to provide developers with a comprehensive suite of free, professional-grade tools that make daily development tasks easier and more efficient.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                With years of experience in full-stack development, I understand the challenges developers face when working with data transformation, encoding, formatting, and various other repetitive tasks. DevTools was born from the desire to streamline these workflows and save valuable development time.
              </p>
            </div>
          </div>

          {/* Expertise Section - Enhanced */}
          <div className="card mb-8 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '200ms' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-3xl"></div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 relative">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              Technical Expertise
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div className="group bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/40 p-6 rounded-xl border-2 border-primary-200 dark:border-primary-800 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-accent-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-4 flex items-center gap-2 relative">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <svg className="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  Backend Development
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 relative">
                  <li className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-medium">Python & Django</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-medium">RESTful APIs</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-medium">Database Design</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-medium">Microservices Architecture</span>
                  </li>
                </ul>
              </div>

              <div className="group bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-900/40 p-6 rounded-xl border-2 border-accent-200 dark:border-accent-800 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500 to-primary-500 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <h3 className="text-xl font-bold text-accent-900 dark:text-accent-100 mb-4 flex items-center gap-2 relative">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <svg className="w-6 h-6 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Frontend Development
                </h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300 relative">
                  <li className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-medium">React & TypeScript</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-medium">Modern UI/UX Design</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-medium">Responsive Development</span>
                  </li>
                  <li className="flex items-center gap-3 group/item hover:translate-x-1 transition-transform">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500 text-white flex items-center justify-center text-xs font-bold">✓</span>
                    <span className="font-medium">Performance Optimization</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Project Mission */}
          <div className="card mb-8 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '300ms' }}>
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-accent-500/10 to-primary-500/10 rounded-full blur-3xl"></div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3 relative">
              <div className="p-2 bg-gradient-to-br from-accent-500 to-primary-500 rounded-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Project Mission
            </h2>
            <div className="bg-gradient-to-r from-primary-50 via-accent-50 to-primary-50 dark:from-primary-900/20 dark:via-accent-900/20 dark:to-primary-900/20 p-6 rounded-xl border-2 border-primary-200 dark:border-primary-800 relative">
              <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                <strong className="text-primary-600 dark:text-primary-400">DevTools</strong> is committed to providing developers worldwide with powerful, fast, and secure tools that enhance productivity. Every tool is crafted with attention to detail, focusing on:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Precision */}
                <div className="group flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Precision</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Accurate results every time</p>
                  </div>
                </div>

                {/* Performance */}
                <div className="group flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Performance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lightning-fast processing</p>
                  </div>
                </div>

                {/* Privacy */}
                <div className="group flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Privacy</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your data never leaves your browser</p>
                  </div>
                </div>

                {/* Free Forever */}
                <div className="group flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Free Forever</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">No subscriptions, no paywalls</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Section - Enhanced */}
          <div className="relative overflow-hidden card animate-fade-in-up bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-800 dark:to-primary-900/20 border-2 border-primary-200 dark:border-primary-800" style={{ animationDelay: '400ms' }}>
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-accent-400 to-primary-400 rounded-full blur-3xl opacity-20"></div>

            <div className="relative">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                Let's Connect
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg">
                I'm always interested in connecting with fellow developers, discussing new ideas, and exploring collaboration opportunities. Feel free to reach out!
              </p>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href="https://www.linkedin.com/in/heshamsayedfarghali/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#0077B5] to-[#00A0DC] hover:from-[#006399] hover:to-[#0077B5] text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="relative z-10">LinkedIn</span>
                  </a>
                  <a
                    href="mailto:hesham.sayed636@gmail.com"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <svg className="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="relative z-10">Email Me</span>
                  </a>
                  <a
                    href="https://wa.me/201062021954"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#1ebe5d] hover:to-[#0e7a6e] text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <svg className="w-6 h-6 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="relative z-10">WhatsApp</span>
                  </a>
                  <Link
                    to="/"
                    className="group relative flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 dark:from-gray-600 dark:to-gray-700 dark:hover:from-gray-500 dark:hover:to-gray-600 text-white rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="relative z-10">Back to Tools</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <AdSidebar sticky />
        </div>
      </div>

      {/* Bottom Ad */}
      <AdBanner slot="bottomBanner" className="mt-8" />
    </div>
  )
}
