import { SEOHead } from "@/components/seo/seo-head";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function TermsAndConditions() {
  const { t } = useTranslation();
  const { language } = useI18n();
  
  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Nutzungsbedingungen | Terms and Conditions | Dopaya' : 'Terms and Conditions'}
        description={language === 'de' ? 'Lese die Nutzungsbedingungen für die Dopaya Impact Rewards Plattform. Erfahre mehr über deine Rechte und Pflichten bei der Nutzung unserer Dienste.' : 'Read the terms and conditions for the Dopaya impact rewards platform. Learn about your rights and obligations when using our services.'}
        keywords={language === 'de' ? 'Nutzungsbedingungen, AGB, Vertragsbedingungen, Plattform-Regeln, Benutzervereinbarung' : 'terms and conditions, terms of service, user agreement, platform rules, legal terms'}
        canonicalUrl={`https://dopaya.com${language === 'de' ? '/de/terms' : '/terms'}`}
        alternateUrls={{
          en: 'https://dopaya.com/terms',
          de: 'https://dopaya.com/de/terms',
        }}
      />
      <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">TERMS AND CONDITIONS</h1>
          
          <div className="space-y-6">
            <p className="text-lg font-semibold text-gray-700">Dopaya – Impact Rewards Platform</p>
            <p className="text-gray-600">Effective Date: 15.12.2025</p>
            
            <p className="mt-4 italic text-gray-700">
              The English version of this document is the legally binding version. Any translations are provided for convenience only.
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">1. INTRODUCTION, OPERATOR & SCOPE</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1.1 Purpose of These Terms</h3>
            
            <p>
              These Terms and Conditions ("Terms") govern your access to and use of the Dopaya impact rewards platform, including the website available at www.dopaya.com, related applications, and associated services (collectively, the "Platform" or "Services").
            </p>
            
            <p>
              These Terms define the legal relationship between you and the platform operator when you access, browse, or use the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1.2 Platform Operator & Contracting Party</h3>
            
            <p>
              The Platform is operated by:
            </p>
            
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                SoVent UG (haftungsbeschränkt)<br/>
                Finkenstrasse 10<br/>
                75239 Eisingen<br/>
                Germany<br/><br/>
                Commercial Register: HRB 745474<br/>
                Register Court: Registergericht Mannheim<br/><br/>
                Email: hello@dopaya.com<br/>
                Website: https://www.dopaya.com
              </p>
            </div>
            
            <p>
              For the purposes of these Terms, "SoVent UG", "Dopaya", "we", "us", or "our" refers exclusively to the platform operator identified above.
            </p>
            
            <p>
              By using the Platform, you enter into a contractual relationship with SoVent UG (haftungsbeschränkt) solely with respect to the provision of the Platform and its technical services.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1.3 Acceptance of Terms</h3>
            
            <p>
              By accessing or using the Platform, you confirm that you have read, understood, and agreed to be bound by these Terms and all documents expressly incorporated by reference, including the Privacy Policy.
            </p>
            
            <p>
              If you do not agree to these Terms, you must not use the Platform.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1.4 Platform Purpose & Role of Dopaya</h3>
            
            <p>
              Dopaya is a technology platform that enables Users to:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>discover selected social enterprises ("Social Enterprises");</li>
              <li>provide voluntary financial support to Social Enterprises via an independent third-party fund handling organization; and</li>
              <li>receive symbolic, non-monetary Impact Points, which may unlock access to third-party rewards.</li>
            </ul>
            
            <p>
              Important clarifications:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Dopaya does not collect, hold, safeguard, or transfer user funds.</li>
              <li>Dopaya does not act as a payment service provider, fundraiser, trustee, bank, or financial intermediary.</li>
              <li>All fund handling, custody, and transfers are performed exclusively by an independent third party as described in Section 3.</li>
            </ul>
            
            <p>
              Financial support constitutes a voluntary transfer of funds initiated by the User and does not create any entitlement to specific outcomes, impact results, or rewards.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1.5 No Advice & No Tax Representation</h3>
            
            <p>
              Information provided on the Platform is for general informational purposes only and does not constitute financial, legal, or tax advice.
            </p>
            
            <p>
              Dopaya makes no representation regarding the tax deductibility of any financial support. Tax treatment depends on the User's jurisdiction and the legal status of the respective Social Enterprise.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1.6 Geographic Scope</h3>
            
            <p>
              These Terms apply to all Users accessing the Platform, subject to mandatory consumer protection laws applicable in the User's country of residence.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1.7 Age Requirement</h3>
            
            <p>
              The Platform may only be used by individuals 18 years of age or older.
            </p>
            
            <p>
              By using the Platform, you represent that you meet this requirement. Dopaya may verify age and suspend or terminate underage accounts.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">2. DEFINITIONS</h2>
            
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>User:</strong> A natural person using the Platform.</li>
              <li><strong>Financial Support:</strong> A voluntary monetary contribution initiated by a User to a Social Enterprise.</li>
              <li><strong>Social Enterprise:</strong> An independent legal entity listed on Dopaya pursuing a social or environmental mission.</li>
              <li><strong>Impaktera:</strong> Impaktera, an association (Verein) registered in Switzerland, acting as an independent third-party fund handler.</li>
              <li><strong>Impact Points:</strong> Symbolic, non-monetary points granted for engagement on the Platform.</li>
              <li><strong>Reward Provider:</strong> An independent third-party company offering rewards accessible via Impact Points.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3. ROLE OF DOPAYA & IMPAKTERA (PAYMENT STRUCTURE)</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3.1 No Payment Services by Dopaya</h3>
            
            <p>
              Dopaya:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>is not a bank, payment institution, electronic money institution, or crowdfunding provider;</li>
              <li>does not provide payment services within the meaning of PSD2 or the German ZAG;</li>
              <li>does not hold or safeguard User funds.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3.2 Independent Fund Handling by Impaktera – Sole Payment Contract</h3>
            
            <p>
              All Financial Support transactions are processed exclusively by Impaktera, acting in its own name and on its own responsibility.
            </p>
            
            <p>
              By initiating Financial Support, the User enters into a separate and direct contractual relationship solely with Impaktera for the handling, processing, and transfer of funds.
            </p>
            
            <p>
              Impaktera is the User's sole contractual partner with respect to:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>payment execution,</li>
              <li>fund handling,</li>
              <li>refund processing, and</li>
              <li>payment-related compliance obligations.</li>
            </ul>
            
            <p>
              Impaktera's applicable terms and conditions, available at:
            </p>
            
            <p className="pl-6">
              <a href="https://www.impaktera.ch/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">https://www.impaktera.ch/terms</a>
            </p>
            
            <p>
              are expressly incorporated by reference into these Terms.
            </p>
            
            <p>
              In case of conflict regarding payment processing, Impaktera's terms prevail.
            </p>
            
            <p>
              Nothing in these Terms creates an agency, fiduciary, trust, partnership, or joint-venture relationship between SoVent UG and Impaktera.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3.3 Liability Allocation & Payment Complaints</h3>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Dopaya is not liable for Impaktera's acts or omissions, including payment delays, failed transactions, or insolvency.</li>
              <li>All payment-related complaints, refund requests, or fund-handling issues must be directed directly to Impaktera.</li>
            </ul>
            
            <p>
              Impaktera contact:
            </p>
            
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                Impaktera c/o<br/>
                Olivier Gröninger<br/>
                Schönaustrasse 43<br/>
                5430 Wettingen<br/><br/>
                impaktera@gmail.com
              </p>
            </div>
            
            <p>
              Dopaya may assist procedurally but does not assume payment liability.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. FINANCIAL SUPPORT & SOCIAL ENTERPRISES</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4.1 Nature of Financial Support</h3>
            
            <p>
              Financial Support:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>is voluntary;</li>
              <li>does not constitute a purchase, investment, or promise of return;</li>
              <li>may not be tax-deductible.</li>
            </ul>
            
            <p>
              Users are solely responsible for assessing tax implications.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4.2 No Guarantee of Impact or Information</h3>
            
            <p>
              Dopaya does not guarantee:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>accuracy or completeness of Social Enterprise information;</li>
              <li>achievement of stated impact;</li>
              <li>use of funds for a specific purpose.</li>
            </ul>
            
            <p>
              Social Enterprises are solely responsible for their representations.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4.3 AML / CTF Transparency</h3>
            
            <p>
              Impaktera performs legally required recipient-level AML/CTF checks.
            </p>
            
            <p>
              Depending on regulatory classification, Dopaya may perform user-level verification or request identification data. Users agree to provide accurate information when required.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4.4 Social Enterprise Eligibility & Vetting</h3>
            
            <p>
              To be listed on Dopaya, Social Enterprises must:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>be a registered legal entity in good standing;</li>
              <li>submit organizational documents and mission statement;</li>
              <li>comply with applicable tax, fundraising, and regulatory laws;</li>
              <li>notify Dopaya of material changes.</li>
            </ul>
            
            <p>
              Dopaya performs basic verification and does not independently audit impact claims.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. CONSUMER RIGHT OF WITHDRAWAL & IMMEDIATE PERFORMANCE</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5.1 Right of Withdrawal (EU Consumers)</h3>
            
            <p>
              If you are a consumer within the European Union, you have a statutory right to withdraw from a Financial Support transaction within 14 days from the date of confirmation, in accordance with Directive 2011/83/EU, provided that the Financial Support has not yet been executed.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5.2 Execution of Financial Support</h3>
            
            <p>
              Financial Support transactions are not transferred immediately to Social Enterprises.
            </p>
            
            <p>
              Instead, Impaktera executes transfers on a periodic basis (e.g. monthly or at other intervals).
            </p>
            
            <p>
              The Financial Support is considered fully executed once the funds have been transferred by Impaktera to the selected Social Enterprise.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5.3 Effect on Withdrawal Right</h3>
            
            <p>
              The right of withdrawal expires once the Financial Support has been fully executed, i.e. once the transfer to the Social Enterprise has taken place.
            </p>
            
            <p>
              Until that time, Users may exercise their statutory right of withdrawal.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5.4 Refund Process</h3>
            
            <p>
              Where withdrawal is exercised before execution:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>Requests must be sent to hello@dopaya.com.</li>
              <li>Refunds are processed by Impaktera to the original payment method.</li>
              <li>Refunds will be completed within 14 days of receipt of a valid withdrawal notice.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">6. IMPACT POINTS</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6.1 Nature</h3>
            
            <p>
              Impact Points are symbolic, non-monetary, have no cash value, and do not constitute property or currency.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6.2 Earning, Expiration & Changes</h3>
            
            <p>
              Rules are displayed on the Platform. Material changes will be notified in advance.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6.3 Revocation</h3>
            
            <p>
              Impact Points may be revoked only in cases of misuse, fraud, or account termination.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">7. REWARDS & COMMERCIAL TRANSPARENCY</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7.1 Third-Party Rewards</h3>
            
            <p>
              Rewards are offered and fulfilled solely by Reward Providers under their own terms.
            </p>
            
            <p>
              Dopaya does not guarantee availability or fulfillment.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7.2 Commercial Relationships</h3>
            
            <p>
              Dopaya may receive compensation from Reward Providers. This does not affect Financial Support or Impact Points.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">8. USER OBLIGATIONS & PROHIBITED CONDUCT</h2>
            
            <p>
              Users must not:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>misrepresent identity or Social Enterprises;</li>
              <li>manipulate Impact Points or Financial Support;</li>
              <li>use bots or automation;</li>
              <li>engage in fraud or unlawful activity.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">9. INTELLECTUAL PROPERTY</h2>
            
            <p>
              All Platform content and software are owned or licensed by SoVent UG.
            </p>
            
            <p>
              Users receive a limited, non-exclusive license for normal platform use.
            </p>
            
            <p>
              Non-commercial sharing (e.g. links, screenshots for reviews) is permitted.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">10. DATA PROTECTION</h2>
            
            <p>
              Personal data is processed in accordance with the GDPR and Swiss data protection law.
            </p>
            
            <p>
              User data is shared with Impaktera where necessary for:
            </p>
            
            <ul className="list-disc pl-6 space-y-2">
              <li>performance of the payment contract (Art. 6(1)(b) GDPR),</li>
              <li>legal compliance (Art. 6(1)(c) GDPR).</li>
            </ul>
            
            <p>
              Further details on data recipients, international transfers, and user rights (Arts. 15–20 GDPR) are set out in the Privacy Policy, which forms an integral part of these Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">11. ACCOUNT SUSPENSION & TERMINATION</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11.1 Material Violations</h3>
            
            <p>
              Material violations include fraud, misrepresentation, automated misuse, or illegal activity.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11.2 Procedure</h3>
            
            <p>
              Where feasible, Dopaya will provide notice and opportunity to cure.
            </p>
            
            <p>
              Users may appeal via hello@dopaya.com.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">12. SERVICE MODIFICATIONS & AVAILABILITY</h2>
            
            <p>
              Dopaya may modify, suspend, or discontinue Services with reasonable notice.
            </p>
            
            <p>
              Material changes to these Terms will be notified at least 30 days in advance.
            </p>
            
            <p>
              The Platform is provided "as available".
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">13. FORCE MAJEURE</h2>
            
            <p>
              Neither party is liable for failure due to events beyond reasonable control, including natural disasters, war, or governmental actions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">14. LIABILITY</h2>
            
            <p>
              Nothing limits liability for intent, gross negligence, or personal injury.
            </p>
            
            <p>
              For slight negligence, liability is limited to foreseeable, typical damages.
            </p>
            
            <p>
              Mandatory consumer rights remain unaffected.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">15. COMPLAINTS & ODR</h2>
            
            <p>
              Complaints: <a href="mailto:hello@dopaya.com" className="text-blue-600 hover:text-blue-800 underline">hello@dopaya.com</a>
            </p>
            
            <p>
              EU ODR platform:
            </p>
            
            <p className="pl-6">
              <a href="https://ec.europa.eu/consumers/odr" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">16. GOVERNING LAW & JURISDICTION</h2>
            
            <p>
              German law applies, without prejudice to mandatory consumer protection laws.
            </p>
            
            <p>
              Jurisdiction: Courts of Baden-Württemberg, Germany.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">17. ASSIGNMENT</h2>
            
            <p>
              SoVent UG may assign its rights and obligations.
            </p>
            
            <p>
              Users may not assign without prior written consent.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">18. NO WAIVER</h2>
            
            <p>
              Failure to enforce any provision does not constitute a waiver.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">19. ENTIRE AGREEMENT</h2>
            
            <p>
              These Terms, together with the Privacy Policy and incorporated documents, constitute the entire agreement governing use of the Platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">20. LANGUAGE & PREVAILING VERSION</h2>
            
            <p>
              English version prevails unless mandatory law requires otherwise.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">21. SEVERABILITY</h2>
            
            <p>
              If any provision is invalid, the remainder remains effective.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">22. CONTACT & LEGAL NOTICE</h2>
            
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                SoVent UG (haftungsbeschränkt)<br/>
                Finkenstrasse 10<br/>
                75239 Eisingen<br/>
                Germany<br/><br/>
                Email: <a href="mailto:hello@dopaya.com" className="text-blue-600 hover:text-blue-800 underline">hello@dopaya.com</a>
              </p>
            </div>
            
            <p>
              For payment-related matters, contact Impaktera directly as per Section 3.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

