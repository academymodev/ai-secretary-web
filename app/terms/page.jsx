import Link from 'next/link'
import { Bot } from 'lucide-react'

export const metadata = { title: 'Terms of Service — Modev Secretary' }

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: May 2025</p>
        </div>
        <section className="space-y-3"><h2 className="text-lg font-semibold">1. Acceptance of Terms</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">By creating an account or using Modev Secretary, you agree to these Terms of Service. If you do not agree, do not use the service.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">2. Description of Service</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">Modev Secretary is a personal productivity assistant that helps you manage tasks, contacts, calendar events, emails, and provides AI-powered daily briefings. The service is provided as-is and may be updated or changed at any time.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">3. User Accounts</h2><ul className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1"><li>You must provide accurate information when creating your account.</li><li>You are responsible for maintaining the security of your password.</li><li>You must not share your account with others.</li><li>You must be at least 13 years old to use this service.</li></ul></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">4. Acceptable Use</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">You agree not to:</p><ul className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 list-disc pl-5 space-y-1"><li>Use the service for any unlawful purpose.</li><li>Attempt to gain unauthorised access to any part of the service.</li><li>Transmit harmful, offensive, or malicious content.</li><li>Reverse engineer or attempt to extract the source code of the service.</li></ul></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">5. Google Account Integration</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">When you connect your Google account, you grant us limited access to your Google Calendar, Gmail, and Contacts solely to provide the features described in the app. You can revoke this access at any time from Settings or your Google Account page. Our use of Google data is governed by the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google API Services User Data Policy</a>.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">6. AI-Generated Content</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">Modev Secretary uses AI (OpenAI GPT-4o and Anthropic Claude) to generate briefings and chat responses. AI-generated content may occasionally be inaccurate or incomplete. You should verify important information independently and not rely solely on AI-generated content for critical decisions.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">7. Data and Privacy</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">Your use of the service is also governed by our <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>, which is incorporated into these terms by reference.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">8. Service Availability</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">We aim to keep Modev Secretary available at all times, but we do not guarantee uninterrupted access. The service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">9. Limitation of Liability</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">Modev Secretary is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">10. Termination</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">You may delete your account at any time from Settings. We reserve the right to suspend or terminate accounts that violate these terms.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">11. Changes to Terms</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">We may update these terms from time to time. Continued use of the service after changes are posted constitutes acceptance of the new terms.</p></section>
        <section className="space-y-3"><h2 className="text-lg font-semibold">12. Contact</h2><p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">For any questions about these terms, contact us at: <a href="mailto:kmohaneesh@gmail.com" className="text-blue-500 hover:underline">kmohaneesh@gmail.com</a></p></section>
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
