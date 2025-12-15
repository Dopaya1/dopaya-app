import { SEOHead } from "@/components/seo/seo-head";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function LegalNotice() {
  const { t } = useTranslation();
  const { language } = useI18n();
  
  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Impressum | Legal Notice | Dopaya' : 'Legal Notice | Impressum | Dopaya'}
        description={language === 'de' ? 'Impressum und rechtliche Angaben zu Dopaya. Kontaktinformationen, Unternehmensdaten und Verantwortliche.' : 'Legal notice and company information for Dopaya. Contact details, company data, and responsible parties.'}
        keywords={language === 'de' ? 'Impressum, rechtliche Angaben, Unternehmensdaten, Kontakt, Verantwortlicher' : 'legal notice, impressum, company information, contact, responsible party'}
        canonicalUrl={`https://dopaya.com${language === 'de' ? '/de/legal' : '/legal'}`}
        alternateUrls={{
          en: 'https://dopaya.com/legal',
          de: 'https://dopaya.com/de/legal',
        }}
      />
      <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {language === 'de' ? 'IMPRESSUM' : 'LEGAL NOTICE'}
          </h1>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">
              {language === 'de' ? 'Unternehmensanschrift:' : 'Company Address:'}
            </h2>
            
            <p>
              SoVent UG (haftungsbeschränkt)<br/>
              Finkenstrasse 10<br/>
              75239 Eisingen<br/>
              {language === 'de' ? 'Deutschland' : 'Germany'}
            </p>
            
            <p>
              <strong>{language === 'de' ? 'E-Mail:' : 'Email:'}</strong> <a href="mailto:hello@dopaya.com" className="text-blue-600 hover:text-blue-800 underline">hello@dopaya.com</a><br/>
              <strong>{language === 'de' ? 'Tel.:' : 'Phone:'}</strong> +49 176 211 40723
            </p>
            
            <p>
              <strong>{language === 'de' ? 'Registergericht:' : 'Register Court:'}</strong> {language === 'de' ? 'Amtsgericht Mannheim' : 'Mannheim Local Court'}<br/>
              <strong>{language === 'de' ? 'Registernummer:' : 'Register Number:'}</strong> HRB 745474
            </p>
            
            <p>
              <strong>{language === 'de' ? 'Umsatzsteuer-Identifikationsnummer:' : 'VAT Identification Number:'}</strong> DE357286031
            </p>
            
            <p>
              <strong>{language === 'de' ? 'Geschäftsführer:' : 'Managing Director:'}</strong> Patrick Widmann
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">
              {language === 'de' 
                ? 'Plattform der EU-Kommission zur Online-Streitbeilegung:' 
                : 'EU Commission Platform for Online Dispute Resolution:'}
            </h2>
            
            <p className="pl-6">
              <a href="https://ec.europa.eu/odr" className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/odr</a>
            </p>
            
            <p>
              {language === 'de' 
                ? 'Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.'
                : 'We are not obligated and not willing to participate in dispute resolution proceedings before a consumer arbitration board.'}
            </p>
            
            <div className="border-t border-gray-300 my-8"></div>

            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">
              {language === 'de' 
                ? 'Verantwortliche/r i.S.d. § 18 Abs. 2 MStV:' 
                : 'Person Responsible pursuant to § 18 para. 2 MStV:'}
            </h2>
            
            <p>
              Patrick Widmann<br/>
              Finkenstrasse 10<br/>
              75239 Eisingen<br/>
              {language === 'de' ? 'Deutschland' : 'Germany'}
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

