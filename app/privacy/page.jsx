import Link from 'next/link'
import { Bot } from 'lucide-react'

export const metadata = { title: 'Privacy Policy — Modev Secretary' }

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200">
      <header className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
          <Bot size={18} />
          Modev Secretary
        </Link>
        <Link href="/login" className="text-sm text-blue-500 hover:underline">Back to app</Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: May 2025</p>
        </div>
        <section className="space-y-3"><h2 className="text-lg font-semibold">1. Who We Are</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">Modev Secretary is a personal productivity assistant that helps you manage tasks, contacts, calendar events, and emails. This policy explains what data we collect, how we use it, and your rights.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">2. Data We Collect</h2><div className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-2"><p><strong>Account data:</strong> Your name, email address, and password (stored as a secure hash).</p><p><strong>Tasks and contacts:</strong> Data you enter directly into the app.</p><p><strong>Google data (if connected):</strong> We access your Google Calendar events, Gmail inbox, and Google Contacts only to display and summarise them within the app. We do not share this data with any third party.</p><p><strong>Usage data:</strong> Basic logs (request timestamps, errors) used to maintain the service. No advertising or analytics profiles are created.</p></div></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">3. How We Use Your Data</h2><ul className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1"><li>To provide the core app features (task management, briefings, AI chat).</li><li>To generate your daily briefing using AI (OpenAI GPT-4o). Only your own data is sent — never another user's data.</li><li>To sync with Google Calendar and Gmail when you explicitly connect your Google account.</li><li>To send push notifications about your tasks and briefings (only if you grant permission).</li></ul></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">4. Google API Data</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">Modev Secretary's use of data received from Google APIs adheres to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p><ul className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1"><li>We only request the minimum scopes necessary to provide the described features.</li><li>Google data is never used for advertising, sold, or shared with third parties.</li><li>Google data is not used to train AI models.</li><li>You can disconnect your Google account at any time from Settings.</li></ul></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">5. Data Storage &amp; Security</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">Your data is stored in Supabase (PostgreSQL) hosted on AWS infrastructure in the US. All data is encrypted in transit (HTTPS/TLS). Passwords are hashed using bcrypt. Google OAuth tokens are stored encrypted and are refreshed automatically.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">6. Data Retention</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">We retain your data for as long as your account is active. You can delete your account at any time from Settings → Delete Account. Upon deletion, all your data is permanently removed within 30 days.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">7. Third-Party Services</h2><div className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 space-y-1"><p>We use the following third-party services:</p><ul className="list-disc pl-5 space-y-1"><li><strong>OpenAI</strong> — AI chat and briefing generation.</li><li><strong>Google APIs</strong> — Calendar, Gmail, and Contacts access when you connect your account.</li><li><strong>Firebase</strong> — Push notifications on Android.</li><li><strong>Supabase</strong> — Database and authentication infrastructure.</li></ul></div></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">8. Your Rights</h2><ul className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1"><li><strong>Access:</strong> You can view all your data within the app.</li><li><strong>Deletion:</strong> Delete your account from Settings at any time.</li><li><strong>Portability:</strong> Contact us to request a data export.</li><li><strong>Revoke Google access:</strong> Disconnect Google from Settings or via your Google Account permissions page.</li></ul></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">9. Contact</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">For any privacy questions or data requests, contact us at: <a href="mailto:kmohaneesh@gmail.com" className="text-blue-500 hover:underline">kmohaneesh@gmail.com</a></p></section>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center text-xs text-gray-400">
        <div className="flex justify-center gap-6">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
