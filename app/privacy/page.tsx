import Link from 'next/link'

export const metadata = { title: 'Privacy Policy & Terms — OMNI Queue' }

export default function PrivacyPage() {
  const updated = 'June 2026'

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-3xl mx-auto px-6 py-12">

        <div className="mb-8">
          <Link href="/" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            ← Back
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">Privacy Policy &amp; Terms of Use</h1>
        <p className="text-sm text-text-tertiary mb-10">OMNI Queue · Last updated {updated}</p>

        <div className="prose-sm space-y-8 text-text-secondary leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">1. About OMNI Queue</h2>
            <p>
              OMNI Queue is a digital queue management platform operated by <strong className="text-text-primary">OMNI Global</strong>.
              It enables businesses (&ldquo;Merchants&rdquo;) to create and manage virtual queues, and allows
              customers (&ldquo;Participants&rdquo;) to join those queues and track their position in real time.
              By accessing or using OMNI Queue — whether as a Merchant, Participant, or visitor — you agree
              to this Privacy Policy and Terms of Use.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">2. Information We Collect</h2>
            <h3 className="font-medium text-text-primary mb-1">Merchant accounts</h3>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Name, email address, and login credentials</li>
              <li>Business name, queue configuration, and service settings</li>
              <li>Queue activity: tickets issued, wait times, throughput, and service metrics</li>
            </ul>
            <h3 className="font-medium text-text-primary mb-1">Queue participants</h3>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Ticket number and queue position</li>
              <li>Approximate wait time and service status</li>
              <li>No personal identification is required to join a queue as a Participant</li>
            </ul>
            <h3 className="font-medium text-text-primary mb-1">Technical data (all users)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Browser type, device type, and IP address (for security and abuse prevention)</li>
              <li>Session tokens stored in browser localStorage to keep you signed in</li>
              <li>Basic usage analytics (page views, feature interactions) — no advertising profiles are built</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To operate and deliver the queue management service</li>
              <li>To display real-time queue position and status to Participants</li>
              <li>To provide Merchants with analytics and performance insights for their queues</li>
              <li>To authenticate users and maintain session security</li>
              <li>To detect and prevent fraud, abuse, or unauthorised access</li>
              <li>To improve platform features and reliability</li>
              <li>To comply with applicable legal obligations</li>
            </ul>
            <p className="mt-3">
              We do <strong className="text-text-primary">not</strong> sell, rent, or trade your personal
              data to third parties. We do not use your data for targeted advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">4. Browser Storage</h2>
            <p>
              OMNI Queue uses <strong className="text-text-primary">browser localStorage</strong> to store
              your session credentials and UI preferences (such as theme or dismissed notifications).
              This data remains on your device and is not transmitted to third parties. You can clear
              it at any time via your browser&apos;s settings. Clearing storage will sign you out and
              reset your preferences.
            </p>
            <p className="mt-2">
              We do not use third-party tracking cookies or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">5. Data Retention</h2>
            <p>
              Merchant account data is retained for as long as the account is active and for a
              reasonable period thereafter to allow for account recovery. Queue ticket records are
              retained for operational analytics and may be anonymised or deleted after 90 days
              at the Merchant&apos;s request. Participants who join without an account have no
              persistent personal data stored beyond the active queue session.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibient text-text-primary mb-3">6. Security</h2>
            <p>
              OMNI Global implements industry-standard security measures including encrypted
              connections (TLS), hashed credential storage, and access controls. However, no system
              is entirely secure and we cannot guarantee absolute security. You are responsible for
              keeping your login credentials confidential.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">7. Merchant Responsibilities</h2>
            <p>
              Merchants using OMNI Queue to serve their customers are independently responsible for
              complying with applicable data protection laws in their jurisdiction. OMNI Global acts
              as a data processor on behalf of Merchants for queue data. Merchants must not collect
              sensitive personal data through queue ticket fields beyond what is necessary for the
              service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">8. Limitation of Liability</h2>
            <p>
              OMNI Queue is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
              OMNI Global is not liable for any loss of revenue, data, or business arising from
              service interruptions, queue disputes between Merchants and Participants, or misuse
              of the platform. The platform is a tool to facilitate queue management; OMNI Global
              does not guarantee wait times, service outcomes, or Merchant behaviour.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">9. Acceptable Use</h2>
            <p>You may not use OMNI Queue to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Impersonate another business or individual</li>
              <li>Manipulate queue positions fraudulently</li>
              <li>Harvest or scrape data from the platform</li>
              <li>Interfere with the platform&apos;s infrastructure or other users&apos; sessions</li>
              <li>Violate any applicable local, national, or international law</li>
            </ul>
            <p className="mt-2">
              OMNI Global reserves the right to suspend or terminate any account found in violation
              of these terms without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Material changes will be communicated
              via in-app notice or email to registered Merchants. Continued use of the platform
              after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-3">11. Contact</h2>
            <p>
              For privacy enquiries, data requests, or to report a concern, contact OMNI Global at{' '}
              <a href="mailto:privacy@omniglobal.one" className="underline hover:text-text-primary transition-colors">
                privacy@omniglobal.one
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-bg-border">
          <p className="text-xs text-text-tertiary text-center">
            &copy; {new Date().getFullYear()} OMNI Global. All rights reserved. OMNI Queue is a product of OMNI Global.
          </p>
        </div>

      </div>
    </div>
  )
}
