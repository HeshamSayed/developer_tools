import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 dark:from-primary-800 dark:via-accent-800 dark:to-primary-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              About DevTools Platform
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Empowering developers worldwide with professional-grade tools and collaborative features
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Platform Overview */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              The Platform
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                What is DevTools Platform?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                DevTools Platform is a comprehensive, enterprise-ready SaaS application designed to streamline
                the development workflow for individuals and teams. With over 117 carefully crafted developer
                tools, we provide solutions for encoding, formatting, data transformation, API testing, and much more.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                Built with modern technologies including React, TypeScript, Django, and PostgreSQL, our platform
                offers lightning-fast performance, real-time collaboration, and enterprise-grade security features.
              </p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Whether you're a solo developer, a startup, or an enterprise organization, DevTools Platform
                scales with your needs through flexible subscription tiers and powerful team collaboration features.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/40 p-6 rounded-2xl border-2 border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">117+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Developer Tools</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Comprehensive suite covering all aspects of development
                </p>
              </div>

              <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-900/40 p-6 rounded-2xl border-2 border-accent-200 dark:border-accent-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-accent-600 dark:text-accent-400">Team</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Collaboration</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Full RBAC with roles, invitations, and audit logging
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 p-6 rounded-2xl border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">100%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Secure & Private</div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  JWT authentication, encryption, and client-side processing
                </p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Enterprise Security</h3>
              <p className="text-gray-600 dark:text-gray-400">
                JWT authentication, role-based access control, audit logging, and encrypted data transmission
              </p>
            </div>

            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track usage, monitor team performance, export data, and gain insights with comprehensive dashboards
              </p>
            </div>

            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Optimized React frontend, efficient Django backend, Redis caching for sub-second response times
              </p>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Built With Modern Technologies
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#61DAFB]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#61DAFB]">⚛</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">React 18</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Frontend</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#3178C6]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#3178C6]">TS</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">TypeScript</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Type Safety</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#092E20]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#092E20] dark:text-green-500">DJ</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">Django</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Backend</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#336791]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#336791]">PG</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">PostgreSQL</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Database</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#DC382D]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#DC382D]">RD</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">Redis</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Cache</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#2496ED]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#2496ED]">🐳</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">Docker</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Container</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#FF6C37]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#FF6C37]">RB</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">RabbitMQ</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Queue</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#38B2AC]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-[#38B2AC]">TW</span>
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">Tailwind</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Styling</div>
              </div>
            </div>
          </div>
        </div>

        {/* Founder Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet the Founder
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary-600 to-accent-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Founder Photo/Avatar */}
            <div className="md:col-span-1">
              <div className="sticky top-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-slow"></div>
                  <div className="relative w-full aspect-square rounded-3xl bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 flex items-center justify-center text-white shadow-2xl ring-4 ring-white dark:ring-gray-800 transform group-hover:scale-105 transition-transform duration-300">
                    <span className="text-9xl font-bold">HS</span>
                  </div>
                </div>
                <div className="text-center mt-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hesham Sayed</h3>
                  <p className="text-lg text-primary-600 dark:text-primary-400 font-semibold mb-4">
                    Founder & Lead Engineer
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <a
                      href="https://www.linkedin.com/in/heshamsayedfarghali/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#0077B5] hover:bg-[#006399] text-white rounded-xl transition-all duration-300 hover:scale-110"
                      title="LinkedIn"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a
                      href="mailto:hesham.sayed636@gmail.com"
                      className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300 hover:scale-110"
                      title="Email"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                    <a
                      href="https://wa.me/201062021954"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-xl transition-all duration-300 hover:scale-110"
                      title="WhatsApp"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Bio */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Professional Background
                </h4>
                <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p>
                    Hesham Sayed is an accomplished Senior Software Engineer with extensive experience in building
                    scalable, enterprise-grade web applications. With a strong foundation in both frontend and backend
                    development, he specializes in creating robust solutions that solve real-world problems for developers
                    and organizations.
                  </p>
                  <p>
                    His expertise spans the full technology stack, from designing intuitive user interfaces with React and
                    TypeScript to architecting high-performance backend systems using Django, PostgreSQL, and microservices.
                    This comprehensive skill set enables him to deliver end-to-end solutions that are both technically
                    excellent and user-friendly.
                  </p>
                  <p>
                    Throughout his career, Hesham has demonstrated a passion for developer tooling and automation,
                    recognizing that the right tools can dramatically improve productivity and code quality. This insight
                    led to the creation of DevTools Platform, which embodies his vision of making professional-grade
                    development tools accessible to everyone.
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Vision & Philosophy
                </h4>
                <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  <p>
                    "Great tools don't just solve problems—they empower developers to focus on what truly matters:
                    building innovative solutions." This philosophy drives every decision in the DevTools Platform.
                  </p>
                  <p>
                    Hesham believes in the power of open collaboration, continuous improvement, and building products
                    that respect user privacy and security. His approach combines technical excellence with practical
                    usability, ensuring that powerful features remain accessible to developers of all skill levels.
                  </p>
                  <p>
                    Looking ahead, his vision for DevTools Platform includes expanding the tool ecosystem, enhancing
                    team collaboration features, and integrating AI-powered assistance to make development workflows
                    even more efficient.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/40 p-6 rounded-2xl border-2 border-primary-200 dark:border-primary-800">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Core Expertise</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      Full-Stack Development
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      System Architecture Design
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      RESTful API Development
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      Database Optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                      DevOps & CI/CD
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-900/40 p-6 rounded-2xl border-2 border-accent-200 dark:border-accent-800">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Achievements</h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                      117+ Production Tools
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                      Enterprise SaaS Platform
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                      Team Collaboration System
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                      Advanced Analytics Engine
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-accent-500 rounded-full"></span>
                      Security & Compliance
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 dark:from-primary-700 dark:via-accent-700 dark:to-primary-800 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Enhance Your Development Workflow?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of developers using DevTools Platform to streamline their work
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-primary-800 text-white rounded-xl font-bold hover:bg-primary-900 transition-all duration-300 hover:scale-105 border-2 border-white/20"
              >
                View Pricing
              </Link>
              <Link
                to="/"
                className="px-8 py-4 bg-transparent text-white rounded-xl font-bold hover:bg-white/10 transition-all duration-300 border-2 border-white"
              >
                Explore Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
