import { SEOHead } from "@/components/seo/seo-head";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const { language } = useI18n();
  
  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Datenschutzerklärung | Privacy Policy | Dopaya' : 'Privacy Policy'}
        description={language === 'de' ? 'Erfahre, wie Dopaya deine persönlichen Informationen sammelt, verwendet und schützt. Lese unsere umfassende Datenschutzerklärung und Datenschutzpraktiken.' : 'Learn about how Dopaya collects, uses, and protects your personal information. Read our comprehensive privacy policy and data protection practices.'}
        keywords={language === 'de' ? 'Datenschutzerklärung, Datenschutz, persönliche Informationen, GDPR, Benutzerdatenschutz, Datensicherheit' : 'privacy policy, data protection, personal information, GDPR, user privacy, data security'}
        canonicalUrl={`https://dopaya.com${language === 'de' ? '/de/privacy' : '/privacy'}`}
        alternateUrls={{
          en: 'https://dopaya.com/privacy',
          de: 'https://dopaya.com/de/privacy',
        }}
      />
      <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">PRIVACY POLICY</h1>

          <div className="space-y-6">
            <p className="text-lg font-semibold text-gray-700">Dopaya – Impact Rewards Platform</p>
            <p className="text-gray-600">Effective Date: 15.12.2025</p>
            
            <p className="mt-4 italic text-gray-700">
              The English version of this document is the legally binding version. Any translations are provided for convenience only.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">1. INTRODUCTION</h2>
            
            <p>
              This Privacy Policy explains how SoVent UG (haftungsbeschränkt) ("Dopaya", "we", "us") processes personal data when you use the Dopaya platform at https://www.dopaya.com and related services (the "Services").
            </p>
            
            <p>
              This Privacy Policy is provided in accordance with the EU General Data Protection Regulation (GDPR), the Swiss Federal Act on Data Protection (FADP), and other applicable privacy laws.
            </p>
            
            <p>
              If you do not agree with this Privacy Policy, please do not use the Services.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">2. DATA CONTROLLER</h2>
            
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                SoVent UG (haftungsbeschränkt)<br/>
                Finkenstrasse 10<br/>
                75239 Eisingen<br/>
                Germany<br/><br/>
                Commercial Register: HRB 745474<br/>
                Register Court: Mannheim<br/><br/>
                📧 <a href="mailto:hello@dopaya.com" className="text-blue-600 hover:text-blue-800 underline">hello@dopaya.com</a><br/>
                🌐 <a href="https://www.dopaya.com" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">https://www.dopaya.com</a>
              </p>
            </div>
            
            <p>
              SoVent UG is the data controller within the meaning of Article 4(7) GDPR for processing activities described in this Privacy Policy.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3. CONTROLLER ROLES & THIRD PARTIES</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3.1 Dopaya</h3>
            
            <p>
              Dopaya acts as an independent data controller for personal data processed for:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>platform access and operation</li>
              <li>user account management</li>
              <li>user communication and support</li>
              <li>analytics, security, and fraud prevention</li>
              <li>compliance with legal obligations</li>
            </ul>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3.2 Impaktera (Independent Fund Handler)</h3>
            
            <p>
              Financial Support transactions are processed exclusively by Impaktera, an independent association (Verein) registered in Switzerland.
            </p>
            
            <p>
              Impaktera acts as a separate and independent data controller for:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>payment execution and fund transfers</li>
              <li>refund processing</li>
              <li>transaction-level AML / CTF compliance</li>
            </ul>
            
            <p>
              Dopaya does not control Impaktera's processing activities and is not responsible for Impaktera's privacy practices.
            </p>
            
            <p>
              Users are encouraged to review Impaktera's own privacy notice.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. PERSONAL DATA WE COLLECT</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4.1 Data You Provide to Dopaya</h3>
            
            <p>
              We may collect:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>name</li>
              <li>email address</li>
              <li>username</li>
              <li>phone number</li>
              <li>communication content (support requests, feedback)</li>
            </ul>
            
            <p>
              <strong>Important clarification:</strong><br/>
              Dopaya does not collect or store payment card data, bank account numbers, or billing information.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4.2 Data Shared with Impaktera (Payment Facilitation)</h3>
            
            <p>
              To technically enable Financial Support transactions, Dopaya may share limited, non-payment personal data with Impaktera, including:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>internal user ID</li>
              <li>selected Social Enterprise</li>
              <li>transaction reference number</li>
              <li>transaction amount</li>
              <li>timestamp of transaction initiation</li>
            </ul>
            
            <p>
              This data transfer is strictly limited to what is necessary to initiate and reconcile the transaction and does not include payment credentials.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4.3 Automatically Collected Data</h3>
            
            <p>
              We automatically collect technical data such as:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address</li>
              <li>browser and device type</li>
              <li>operating system</li>
              <li>language preferences</li>
              <li>usage data (pages visited, timestamps)</li>
            </ul>
            
            <p>
              This data is used for security, stability, and analytics.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. COOKIES & TRACKING</h2>
            
            <p>
              We use cookies and similar technologies for:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>essential site functionality</li>
              <li>security</li>
              <li>analytics</li>
              <li>consent-based marketing (where applicable)</li>
            </ul>
            
            <p>
              Details are available in our Cookie Policy:<br/>
              👉 <a href="https://www.dopaya.com/cookies" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">https://www.dopaya.com/cookies</a>
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">6. PURPOSES & LEGAL BASES OF PROCESSING</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6.1 Legal Bases (GDPR)</h3>
            
            <p>
              We process personal data based on the following legal grounds:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Art. 6(1)(b) – performance of a contract (user accounts, platform access)</li>
              <li>Art. 6(1)(c) – compliance with legal obligations</li>
              <li>Art. 6(1)(a) – consent (marketing, non-essential cookies)</li>
              <li>Art. 6(1)(f) – legitimate interests</li>
            </ul>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6.2 Legitimate Interests (Art. 6(1)(f) GDPR)</h3>
            
            <p>
              Where processing is based on legitimate interests, these include:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>ensuring platform security and preventing misuse or fraud</li>
              <li>maintaining technical stability and performance</li>
              <li>analyzing usage patterns to improve Services</li>
            </ul>
            
            <p>
              These interests are balanced against Users' fundamental rights and freedoms by:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>minimizing data collection</li>
              <li>using pseudonymization where possible</li>
              <li>limiting access to authorized personnel</li>
              <li>offering opt-out mechanisms where applicable</li>
            </ul>
            
            <p>
              Dopaya does not process personal data under Art. 6(1)(f) where the User's interests override these legitimate interests.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">7. DATA SHARING & PROCESSORS</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7.1 Recipients</h3>
            
            <p>
              Personal data may be shared with:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Impaktera (independent controller – payment processing)</li>
              <li>hosting and cloud infrastructure providers</li>
              <li>analytics providers (e.g. Google Analytics)</li>
              <li>email and communication service providers</li>
              <li>professional advisors (legal, accounting)</li>
              <li>authorities where legally required</li>
            </ul>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7.2 Processors (Art. 28 GDPR)</h3>
            
            <p>
              Where third-party service providers process personal data on behalf of Dopaya, they act as processors under Article 28 GDPR.
            </p>
            
            <p>
              Dopaya has entered into data processing agreements with such processors, ensuring:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>processing only on documented instructions</li>
              <li>appropriate technical and organizational security measures</li>
              <li>confidentiality and data protection obligations</li>
            </ul>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">8. INTERNATIONAL DATA TRANSFERS</h2>
            
            <p>
              Personal data may be transferred outside the EU/EEA.
            </p>
            
            <p>
              Transfers to Switzerland are based on the European Commission's adequacy decision (Art. 45 GDPR).
            </p>
            
            <p>
              Where required, additional safeguards (e.g. Standard Contractual Clauses) are applied.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">9. DATA RETENTION</h2>
            
            <p>
              Personal data is retained only as long as necessary for the stated purposes or to comply with legal obligations.
            </p>
            
            <p>
              Retention periods may vary depending on legal, regulatory, or security requirements.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">10. SECURITY</h2>
            
            <p>
              We implement appropriate technical and organizational measures to protect personal data.
            </p>
            
            <p>
              However, no system can be guaranteed to be fully secure.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">11. AUTOMATED DECISION-MAKING</h2>
            
            <p>
              Dopaya does not conduct automated decision-making or profiling within the meaning of Article 22 GDPR.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">12. MINORS</h2>
            
            <p>
              The Services are intended for users 18 years or older.
            </p>
            
            <p>
              We do not knowingly collect data from minors.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">13. YOUR RIGHTS</h2>
            
            <p>
              Depending on your jurisdiction, you may have rights to:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>access</li>
              <li>rectification</li>
              <li>erasure</li>
              <li>restriction</li>
              <li>portability</li>
              <li>objection</li>
              <li>withdrawal of consent</li>
            </ul>
            
            <p>
              Requests may be submitted to <a href="mailto:hello@dopaya.com" className="text-blue-600 hover:text-blue-800 underline">hello@dopaya.com</a>.
            </p>
            
            <p>
              You also have the right to lodge a complaint with a supervisory authority.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">14. US & CANADA PRIVACY RIGHTS</h2>
            
            <p>
              Where applicable, Dopaya complies with relevant US state privacy laws and Canadian privacy laws.
            </p>
            
            <p>
              We do not sell personal data.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">15. UPDATES TO THIS POLICY</h2>
            
            <p>
              We may update this Privacy Policy from time to time.
            </p>
            
            <p>
              Material changes will be communicated appropriately.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">16. CONTACT</h2>
            
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                SoVent UG (haftungsbeschränkt)<br/>
                Finkenstrasse 10<br/>
                75239 Eisingen<br/>
                Germany<br/><br/>
                📧 <a href="mailto:hello@dopaya.com" className="text-blue-600 hover:text-blue-800 underline">hello@dopaya.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}