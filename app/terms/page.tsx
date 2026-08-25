"use client";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: December 17, 2024</p>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Trade Freedoms ("the Platform"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these Terms of Service, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
            <p className="leading-relaxed mb-3">
              You must be at least 18 years old to use this Platform. By registering, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You are at least 18 years of age</li>
              <li>You have the legal capacity to enter into binding contracts</li>
              <li>Your use of the Platform does not violate any applicable law or regulation</li>
              <li>All information you provide is accurate and complete</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p className="leading-relaxed mb-3">
              To access certain features of the Platform, you must register for an account:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Trading Services</h2>
            <p className="leading-relaxed mb-3">
              Our Platform provides cryptocurrency trading services including Spot, Option, and Swap trading:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Trading involves significant risk and may result in loss of funds</li>
              <li>You trade at your own risk and are solely responsible for your trading decisions</li>
              <li>We do not provide investment advice or recommendations</li>
              <li>Past performance does not guarantee future results</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Deposits and Withdrawals</h2>
            <p className="leading-relaxed mb-3">
              All deposits and withdrawals are subject to our policies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Minimum deposit and withdrawal amounts may apply</li>
              <li>Processing times vary depending on the payment method</li>
              <li>You are responsible for any fees charged by third-party payment processors</li>
              <li>We reserve the right to reject or delay transactions for security or compliance reasons</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. KYC and AML Compliance</h2>
            <p className="leading-relaxed mb-3">
              We are committed to preventing money laundering and terrorist financing:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You may be required to complete KYC (Know Your Customer) verification</li>
              <li>We reserve the right to request additional documentation at any time</li>
              <li>Failure to provide requested information may result in account restrictions</li>
              <li>We comply with all applicable AML regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Prohibited Activities</h2>
            <p className="leading-relaxed mb-3">
              You agree not to engage in any of the following prohibited activities:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violating any laws or regulations</li>
              <li>Engaging in market manipulation or fraudulent trading</li>
              <li>Using the Platform for money laundering or terrorist financing</li>
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Creating multiple accounts to circumvent restrictions</li>
              <li>Using bots or automated trading without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Fees and Charges</h2>
            <p className="leading-relaxed">
              We charge fees for certain services. All applicable fees will be clearly disclosed before you complete 
              a transaction. We reserve the right to modify our fee structure at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, Trade Freedoms shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
              or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="leading-relaxed mb-3">
              We reserve the right to suspend or terminate your account:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>If you violate these Terms of Service</li>
              <li>If we suspect fraudulent or illegal activity</li>
              <li>For security or compliance reasons</li>
              <li>At our sole discretion with or without notice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material 
              changes via email or platform notification. Your continued use of the Platform after such modifications 
              constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:{" "}
              <a href="mailto:support@tradefreedoms.com" className="text-primary hover:underline">
                support@tradefreedoms.com
              </a>
            </p>
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
