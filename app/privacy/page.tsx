"use client";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 17, 2024</p>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Trade Freedoms ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our cryptocurrency 
              trading platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">2.1 Personal Information</h3>
            <p className="leading-relaxed mb-3">
              We collect personal information that you provide to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email address and password</li>
              <li>Full name and date of birth (for KYC verification)</li>
              <li>Government-issued ID documents</li>
              <li>Address and contact information</li>
              <li>Financial information (wallet addresses, transaction history)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>IP address and device information</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and time spent on our platform</li>
              <li>Trading activity and preferences</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain our trading services</li>
              <li>To process your transactions and deposits/withdrawals</li>
              <li>To verify your identity and comply with KYC/AML regulations</li>
              <li>To detect and prevent fraud and security threats</li>
              <li>To improve our platform and user experience</li>
              <li>To send you important updates and notifications</li>
              <li>To provide customer support</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="leading-relaxed mb-3">
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Providers:</strong> With third-party vendors who help us operate our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
            </ul>
            <p className="leading-relaxed mt-4">
              <strong>We will never sell your personal information to third parties for marketing purposes.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="leading-relaxed mb-3">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Two-factor authentication (2FA) for account security</li>
              <li>Regular security audits and penetration testing</li>
              <li>Restricted access to personal information</li>
              <li>Secure data storage and backup systems</li>
            </ul>
            <p className="leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security 
              of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal information for as long as necessary to provide our services and comply with legal 
              obligations. After account closure, we may retain certain information as required by law or for legitimate 
              business purposes, such as fraud prevention and compliance with regulatory requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="leading-relaxed mb-3">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information</li>
              <li><strong>Portability:</strong> Request transfer of your data to another service</li>
              <li><strong>Objection:</strong> Object to certain processing of your information</li>
              <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="leading-relaxed mt-4">
              To exercise these rights, please contact us at{" "}
              <a href="mailto:privacy@tradefreedoms.com" className="text-primary hover:underline">
                privacy@tradefreedoms.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking</h2>
            <p className="leading-relaxed mb-3">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized content and features</li>
              <li>Detect and prevent fraud</li>
            </ul>
            <p className="leading-relaxed mt-4">
              You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
            <p className="leading-relaxed">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards 
              to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="leading-relaxed">
              Our platform is not intended for individuals under the age of 18. We do not knowingly collect personal 
              information from children. If you believe we have collected information from a child, please contact us 
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by email 
              or through a prominent notice on our platform. Your continued use of our services after such changes 
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 space-y-2">
              <p>Email: <a href="mailto:privacy@tradefreedoms.com" className="text-primary hover:underline">privacy@tradefreedoms.com</a></p>
              <p>Support: <a href="mailto:support@tradefreedoms.com" className="text-primary hover:underline">support@tradefreedoms.com</a></p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline"
          >
            ← Back to previous page
          </button>
        </div>
      </div>
    </div>
  );
}
