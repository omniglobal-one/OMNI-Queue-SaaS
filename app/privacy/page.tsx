import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Use — OMNI Queue',
  description: 'Privacy Policy, Terms of Use, and Fair Use Guidelines for the OMNI Queue digital queue management platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="border-b border-bg-border bg-bg-card">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">O</span>
            </div>
            <span className="font-semibold text-text-primary">OMNI Queue</span>
          </div>
          <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Back to login
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 space-y-12">

        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-1">Privacy Policy &amp; Terms of Use</h1>
          <p className="text-sm text-text-secondary">Last updated: June 2026</p>
          <p className="text-sm text-text-secondary mt-3">
            Your privacy and trust are important to us. This page outlines how we collect, use, and protect your data, and the terms that govern your use of OMNI Queue.
          </p>
        </div>

        {/* ── Privacy Policy ── */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-text-primary border-b border-bg-border pb-3">Privacy Policy</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Introduction</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Queue is a digital queue management platform operated by OMNI Global that enables merchants to create and manage virtual queues, and allows customers to join queues and track their position in real time. This Privacy Policy explains how we collect, use, store, and disclose your personal information when you access and interact with our platform, whether as a merchant, a queue participant, or a visitor.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Information We Collect</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We collect personal information you voluntarily provide when creating a merchant account or configuring queues. This may include your name, email address, business name, and account role. We also collect operational data such as queue configurations, ticket records, wait times, and throughput metrics as part of providing the queue management service. Queue participants who join without a registered account are not required to provide personal identification; only a ticket number and queue position are associated with their session.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">How We Use Your Information</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We use your information to operate and improve the OMNI Queue platform, manage merchant accounts and queue configurations, display real-time queue position and status to participants, provide merchants with analytics and performance insights, and communicate with you about your account. We do not sell your personal information to third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Demo Accounts</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Queue may provide merchant demo accounts strictly for demonstration purposes. These accounts are pre-configured with sample queues and ticket data to showcase platform features. All data within demo accounts is fictional and exists solely to illustrate platform functionality. Demo accounts may be revoked, reset, or modified at any time without notice. To opt out of a demo account or request deletion of any associated data, contact us at{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Third-Party Service Providers</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We engage reputable third-party service providers to host and operate the OMNI Queue platform. Our primary infrastructure providers include Supabase (database, authentication, and real-time data services) and Vercel (application hosting and content delivery). These providers may process your personal data on our behalf solely for the purposes of delivering the service. Each provider is bound by a data processing agreement and is contractually obligated to protect your data. We do not authorise any third-party provider to sell or independently use your personal information.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              By using our platform, you acknowledge that your data may be processed by these providers in accordance with their respective data protection commitments. We regularly review our providers to ensure they meet appropriate security and privacy standards.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Data Security</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We implement appropriate technical and organisational safeguards to protect your personal data against unauthorised access, loss, or disclosure. These measures include encrypted data transmission, secure authentication mechanisms, access controls, and the use of industry-standard credential hashing. However, no method of internet transmission or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Cookies and Browser-Based Storage Technologies</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We do not use advertising cookies or third-party tracking cookies. Our platform uses browser-based storage technologies to remember your preferences and maintain your session. This data is stored locally on your device and is not collected, transmitted to, or retained on OMNI Global&apos;s servers. You may clear this data at any time through your browser or device settings; doing so may affect certain functionality of the platform. Continued use of the platform constitutes your acknowledgment of our use of browser-based storage technologies as described in this notice.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Your authentication session is managed using secure, HTTP-only cookies set by our authentication provider (Supabase). These are strictly necessary for login functionality and cannot be disabled without preventing access to your account.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Third-Party Websites</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Our platform may contain links to third-party websites or integrate with external services. We do not control the content, privacy practices, or policies of any third-party site and assume no responsibility for them. We encourage you to review the privacy policy of any third-party site or service you visit.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Data Retention</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We retain merchant account data for as long as the account is active or as necessary to provide our services. Queue ticket records may be retained for operational analytics and will be anonymised or deleted upon account closure. If you request deletion of your account, we will remove your personal data from our active systems within a reasonable timeframe, subject to any legal obligations requiring us to retain certain records. Some data may be retained in anonymised or aggregated form for internal analytics. Data held in backup systems may take additional time to be fully purged.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Your Rights</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You may request access to, correction of, or deletion of your personal information at any time by contacting us at{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>. We will respond promptly in accordance with applicable laws.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Children&apos;s Privacy</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Queue is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. We rely on users to confirm they meet the minimum age requirement when creating an account.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              If you are a parent or guardian and believe that your child under the age of 13 has registered an account or provided us with personal information without your consent, please contact us immediately at{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>{' '}
              with the subject line &quot;Child Privacy Report.&quot; Upon receiving a verified report, we will promptly investigate; delete the child&apos;s account and all associated personal data from our active systems within 30 days of confirmation; request deletion of any data held by our sub-processors where technically feasible; and send written confirmation to the reporting parent or guardian. We take child privacy seriously and comply with applicable child privacy laws, including the Children&apos;s Online Privacy Protection Act (COPPA) where relevant to our users.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Updates to This Policy</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page, and continued use of the platform constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* ── Terms of Use ── */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-text-primary border-b border-bg-border pb-3">Terms of Use</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Acceptance of Terms</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              By accessing and using OMNI Queue, you agree to comply with and be bound by these Terms of Use. If you do not agree, please do not use the platform.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Intellectual Property</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              All content on this platform, including text, logos, design, and software, is protected by copyright and intellectual property laws. You may not copy, distribute, or modify any content without prior written consent from OMNI Global.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Merchant Responsibilities</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Merchants are responsible for the accuracy of their queue configurations, service descriptions, and any customer-facing information published on the platform. Merchants are also responsible for ensuring that any customer data collected through the platform is handled in accordance with applicable privacy laws and that appropriate consent has been obtained where required. OMNI Global provides the technical infrastructure for queue management but is not responsible for the conduct, service quality, or data practices of individual merchants.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Demo Account Terms</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Demo accounts are granted strictly for the purpose of evaluating and demonstrating OMNI Queue. You agree not to use demo accounts for live commercial operations or to manage real customer queues. Demo accounts may be suspended or reset at any time. To opt out or request data removal, email{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Prohibited Conduct</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You agree not to attempt to disrupt, hack, or gain unauthorised access to any part of the platform, inject malicious code, harvest data using automated means, manipulate queue positions fraudulently, impersonate another business or individual, or engage in any activity that degrades the experience of other users or violates any applicable law.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Account Security</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You are responsible for maintaining the confidentiality of your login credentials and any access links associated with your account. You are liable for all activity conducted under your account. Do not share credentials with unauthorised parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Accuracy of Information</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You represent and warrant that all information you provide to the platform is accurate, current, and complete. You agree to promptly update your information if it changes. We reserve the right to suspend or terminate accounts where we have reasonable grounds to believe that information provided is false, misleading, or used to misrepresent your identity or intentions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Indemnification</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              You agree to indemnify, defend, and hold harmless OMNI Global, its officers, employees, and agents from and against any claims, liabilities, damages, losses, or expenses (including reasonable legal fees) arising out of or in connection with: your use or misuse of the platform; your violation of these Terms or any applicable law; your violation of the rights of any third party; or any content, data, or information you submit, post, or transmit through the platform.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Disclaimer of Warranty</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Queue is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted access, accuracy of data, specific wait times, service outcomes, or fitness for a particular purpose. OMNI Global is a tool to facilitate queue management and does not guarantee the conduct or service quality of any merchant. Use of the platform is at your own risk.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Limitation of Liability</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Global and its affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, revenue, or business opportunity, queue disputes between merchants and participants, or service interruptions, even if advised of the possibility of such damages.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Force Majeure</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Global shall not be liable for any failure or delay in performance due to causes beyond our reasonable control, including acts of God, natural disasters, pandemic, war, civil unrest, internet or telecommunications failures, government actions, or failures of third-party service providers. Our obligations are suspended for the duration of any such event.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Severability</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision will be limited or eliminated to the minimum extent necessary. The remaining provisions will continue in full force and effect.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Entire Agreement</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and OMNI Global regarding your use of the platform and supersede all prior agreements or understandings. Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Governing Law</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              These Terms shall be governed by the laws of Zimbabwe. Any dispute shall be exclusively resolved in courts located in Zimbabwe.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Changes to Terms</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms.
            </p>
          </div>
        </section>

        {/* ── Fair Use ── */}
        <section className="space-y-8">
          <h2 className="text-xl font-bold text-text-primary border-b border-bg-border pb-3">Fair Use Guidelines</h2>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Responsible Usage</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              OMNI Queue is designed for standard merchant queue management use. We monitor platform usage to ensure fairness and reliability for all users. We reserve the right to review, limit, or restrict any usage that is excessive, disruptive, or inconsistent with the platform&apos;s intended purpose.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-text-primary">Discretion to Serve</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              We retain sole discretion to accept, decline, or discontinue service for any reason, including if we determine that a user&apos;s content or behaviour does not align with our platform values or community standards.
            </p>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="card p-6 space-y-2">
          <h2 className="font-semibold text-text-primary">Contact Us</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            If you have questions about this Privacy Policy, Terms of Use, or Fair Use Guidelines, or wish to exercise your rights, please contact us at:
          </p>
          <a href="mailto:omniglobal.one@gmail.com" className="text-sm text-primary hover:underline font-medium">
            omniglobal.one@gmail.com
          </a>
        </section>

        <div className="flex items-center justify-between pt-4 border-t border-bg-border text-xs text-text-tertiary">
          <span>&copy; 2026 OMNI Global. All rights reserved.</span>
          <Link href="/login" className="hover:text-text-secondary transition-colors">Back to login</Link>
        </div>
      </div>
    </div>
  )
}
