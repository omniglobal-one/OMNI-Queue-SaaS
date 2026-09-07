import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms of Use — OMNI Queue',
  description: 'Privacy Policy, Terms of Use, and Fair Use Guidelines for the OMNI Queue digital queue management platform.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-2">
            <Image src="/icon.png" alt="" width={28} height={28} className="rounded-md" />
            <span className="font-semibold">OMNI Queue</span>
          </div>
          <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Back to login
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-12 px-5 py-12 sm:px-8">

        <div>
          <h1 className="mb-1 text-2xl font-bold">Privacy Policy &amp; Terms of Use</h1>
          <p className="text-sm text-muted-foreground">Last updated: June 2026</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Your privacy and trust are important to us. This page outlines how we collect, use, and protect your data, and the terms that govern your use of OMNI Queue.
          </p>
        </div>

        {/* ── Privacy Policy ── */}
        <section className="space-y-8">
          <h2 className="border-b border-border pb-3 text-xl font-bold">Privacy Policy</h2>

          <div className="space-y-2">
            <h3 className="font-semibold">Introduction</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              OMNI Queue is a digital queue management platform operated by OMNI Global that enables merchants to create and manage virtual queues, and allows customers to join queues and track their position in real time. This Privacy Policy explains how we collect, use, store, and disclose your personal information when you access and interact with our platform, whether as a merchant, a queue participant, or a visitor.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Information We Collect</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We collect personal information you voluntarily provide when creating a merchant account or configuring queues. This may include your name, email address, business name, and account role. We also collect operational data such as queue configurations, ticket records, wait times, and throughput metrics as part of providing the queue management service. Queue participants who join without a registered account are not required to provide personal identification; only a ticket number and queue position are associated with their session.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">How We Use Your Information</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use your information to operate and improve the OMNI Queue platform, manage merchant accounts and queue configurations, display real-time queue position and status to participants, provide merchants with analytics and performance insights, and communicate with you about your account. We do not sell your personal information to third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Demo Accounts</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              OMNI Queue may provide merchant demo accounts strictly for demonstration purposes. These accounts are pre-configured with sample queues and ticket data to showcase platform features. All data within demo accounts is fictional and exists solely to illustrate platform functionality. Demo accounts may be revoked, reset, or modified at any time without notice. To opt out of a demo account or request deletion of any associated data, contact us at{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Third-Party Service Providers</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We engage reputable third-party service providers to host and operate the OMNI Queue platform. Our primary infrastructure providers include Supabase (database, authentication, and real-time data services) and Vercel (application hosting and content delivery). These providers may process your personal data on our behalf solely for the purposes of delivering the service. Each provider is bound by a data processing agreement and is contractually obligated to protect your data. We do not authorise any third-party provider to sell or independently use your personal information.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By using our platform, you acknowledge that your data may be processed by these providers in accordance with their respective data protection commitments. We regularly review our providers to ensure they meet appropriate security and privacy standards.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Data Security</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We implement appropriate technical and organisational safeguards to protect your personal data against unauthorised access, loss, or disclosure. These measures include encrypted data transmission, secure authentication mechanisms, access controls, and the use of industry-standard credential hashing. However, no method of internet transmission or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Cookies and Browser-Based Storage Technologies</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We do not use advertising cookies or third-party tracking cookies. Our platform uses browser-based storage technologies to remember your preferences and maintain your session. This data is stored locally on your device and is not collected, transmitted to, or retained on OMNI Global&apos;s servers. You may clear this data at any time through your browser or device settings; doing so may affect certain functionality of the platform. Continued use of the platform constitutes your acknowledgment of our use of browser-based storage technologies as described in this notice.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your authentication session is managed using secure, HTTP-only cookies set by our authentication provider (Supabase). These are strictly necessary for login functionality and cannot be disabled without preventing access to your account.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Third-Party Websites</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Our platform may contain links to third-party websites or integrate with external services. We do not control the content, privacy practices, or policies of any third-party site and assume no responsibility for them. We encourage you to review the privacy policy of any third-party site or service you visit.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Data Retention</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We retain merchant account data for as long as the account is active or as necessary to provide our services. Queue ticket records may be retained for operational analytics and will be anonymised or deleted upon account closure. If you request deletion of your account, we will remove your personal data from our active systems within a reasonable timeframe, subject to any legal obligations requiring us to retain certain records. Some data may be retained in anonymised or aggregated form for internal analytics. Data held in backup systems may take additional time to be fully purged.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Your Rights</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You may request access to, correction of, or deletion of your personal information at any time by contacting us at{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>. We will respond promptly in accordance with applicable laws.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Children&apos;s Privacy</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              OMNI Queue is not intended for individuals under 13 years of age. We do not knowingly collect personal information from children under 13. We rely on users to confirm they meet the minimum age requirement when creating an account.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you are a parent or guardian and believe that your child under the age of 13 has registered an account or provided us with personal information without your consent, please contact us immediately at{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>{' '}
              with the subject line &quot;Child Privacy Report.&quot; Upon receiving a verified report, we will promptly investigate; delete the child&apos;s account and all associated personal data from our active systems within 30 days of confirmation; request deletion of any data held by our sub-processors where technically feasible; and send written confirmation to the reporting parent or guardian. We take child privacy seriously and comply with applicable child privacy laws, including the Children&apos;s Online Privacy Protection Act (COPPA) where relevant to our users.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Updates to This Policy</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We reserve the right to update this Privacy Policy at any time. Changes will be posted on this page, and continued use of the platform constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* ── Terms of Use ── */}
        <section className="space-y-8">
          <h2 className="border-b border-border pb-3 text-xl font-bold">Terms of Use</h2>

          <div className="space-y-2">
            <h3 className="font-semibold">Acceptance of Terms</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By accessing and using OMNI Queue, you agree to comply with and be bound by these Terms of Use. If you do not agree, please do not use the platform.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Intellectual Property</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              All content on this platform, including text, logos, design, and software, is protected by copyright and intellectual property laws. You may not copy, distribute, or modify any content without prior written consent from OMNI Global.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Merchant Responsibilities</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Merchants are responsible for the accuracy of their queue configurations, service descriptions, and any customer-facing information published on the platform. Merchants are also responsible for ensuring that any customer data collected through the platform is handled in accordance with applicable privacy laws and that appropriate consent has been obtained where required. OMNI Global provides the technical infrastructure for queue management but is not responsible for the conduct, service quality, or data practices of individual merchants.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Demo Account Terms</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Demo accounts are granted strictly for the purpose of evaluating and demonstrating OMNI Queue. You agree not to use demo accounts for live commercial operations or to manage real customer queues. Demo accounts may be suspended or reset at any time. To opt out or request data removal, email{' '}
              <a href="mailto:omniglobal.one@gmail.com" className="text-primary hover:underline">omniglobal.one@gmail.com</a>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Prohibited Conduct</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You agree not to attempt to disrupt, hack, or gain unauthorised access to any part of the platform, inject malicious code, harvest data using automated means, manipulate queue positions fraudulently, impersonate another business or individual, or engage in any activity that degrades the experience of other users or violates any applicable law.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Account Security</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You are responsible for maintaining the confidentiality of your login credentials and any access links associated with your account. You are liable for all activity conducted under your account. Do not share credentials with unauthorised parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Accuracy of Information</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You represent and warrant that all information you provide to the platform is accurate, current, and complete. You agree to promptly update your information if it changes. We reserve the right to suspend or terminate accounts where we have reasonable grounds to believe that information provided is false, misleading, or used to misrepresent your identity or intentions.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Indemnification</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You agree to indemnify, defend, and hold harmless OMNI Global, its officers, employees, and agents from and against any claims, liabilities, damages, losses, or expenses (including reasonable legal fees) arising out of or in connection with: your use or misuse of the platform; your violation of these Terms or any applicable law; your violation of the rights of any third party; or any content, data, or information you submit, post, or transmit through the platform.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Disclaimer of Warranty</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              OMNI Queue is provided &quot;as is&quot; without warranties of any kind. We do not guarantee uninterrupted access, accuracy of data, specific wait times, service outcomes, or fitness for a particular purpose. OMNI Global is a tool to facilitate queue management and does not guarantee the conduct or service quality of any merchant. Use of the platform is at your own risk.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Limitation of Liability</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              OMNI Global and its affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform, including loss of data, revenue, or business opportunity, queue disputes between merchants and participants, or service interruptions, even if advised of the possibility of such damages.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Force Majeure</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              OMNI Global shall not be liable for any failure or delay in performance due to causes beyond our reasonable control, including acts of God, natural disasters, pandemic, war, civil unrest, internet or telecommunications failures, government actions, or failures of third-party service providers. Our obligations are suspended for the duration of any such event.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Severability</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision will be limited or eliminated to the minimum extent necessary. The remaining provisions will continue in full force and effect.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Entire Agreement</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and OMNI Global regarding your use of the platform and supersede all prior agreements or understandings. Our failure to enforce any right or provision of these Terms shall not constitute a waiver of that right or provision.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Governing Law</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              These Terms shall be governed by the laws of Zimbabwe. Any dispute shall be exclusively resolved in courts located in Zimbabwe.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Changes to Terms</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the revised Terms.
            </p>
          </div>
        </section>

        {/* ── Fair Use ── */}
        <section className="space-y-8">
          <h2 className="border-b border-border pb-3 text-xl font-bold">Fair Use Guidelines</h2>

          <div className="space-y-2">
            <h3 className="font-semibold">Responsible Usage</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              OMNI Queue is designed for standard merchant queue management use. We monitor platform usage to ensure fairness and reliability for all users. We reserve the right to review, limit, or restrict any usage that is excessive, disruptive, or inconsistent with the platform&apos;s intended purpose.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Discretion to Serve</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We retain sole discretion to accept, decline, or discontinue service for any reason, including if we determine that a user&apos;s content or behaviour does not align with our platform values or community standards.
            </p>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="space-y-2 rounded-xl border border-border/80 bg-card p-6">
          <h2 className="font-semibold">Contact Us</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            If you have questions about this Privacy Policy, Terms of Use, or Fair Use Guidelines, or wish to exercise your rights, please contact us at:
          </p>
          <a href="mailto:omniglobal.one@gmail.com" className="text-sm font-medium text-primary hover:underline">
            omniglobal.one@gmail.com
          </a>
        </section>

        <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>&copy; 2026 OMNI Global. All rights reserved.</span>
          <Link href="/login" className="hover:text-foreground transition-colors">Back to login</Link>
        </div>
      </div>
    </div>
  )
}
