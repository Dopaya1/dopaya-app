import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check } from "lucide-react";
import patrickWidmannImage from "@/assets/Patrick Widmann_1749545204060.png";
import abdulMujeebImage from "@/assets/Abdul Mujeeb_1749476510704.png";
import shaliniSinghImage from "@/assets/Shalini Singh_1749476510708.png";
import SESpectrumSlider from "@/components/ui/se-spectrum-slider";
import { TYPOGRAPHY } from "@/constants/typography";
import { SEOHead } from "@/components/seo/seo-head";

export default function AboutPageV2() {
  return (
    <>
      <SEOHead
        title="About Dopaya - Building the Future of Social Impact | Our Mission & Team"
        description="Learn about Dopaya's mission to make social impact more transparent and rewarding. Meet our team building the platform that connects supporters with verified social enterprises."
        keywords="about dopaya, social impact mission, social enterprise platform, impact transparency, social impact team, sustainable development, social entrepreneurship"
        canonicalUrl="https://dopaya.org/about"
        ogType="website"
        ogImage="https://dopaya.org/og-about.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Dopaya",
          "description": "Learn about Dopaya's mission to make social impact more transparent and rewarding",
          "url": "https://dopaya.org/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "Dopaya",
            "description": "Social impact platform connecting supporters with verified social enterprises",
            "foundingDate": "2024",
            "founder": {
              "@type": "Person",
              "name": "Patrick Widmann"
            },
            "mission": "Making social impact more transparent, rewarding, and community-led"
          }
        }}
      />
      
      <div className="min-h-screen bg-white">
      {/* SECTION 1 - Name Meaning - Hero Section with Light Beige Background */}
      <section className={`w-full py-24`} style={{ backgroundColor: '#f8f6f1' }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#f2662d] mb-4">[du·pa·ya]</h1>
            <p className="text-gray-600 mb-8">(Origin: Sanskrit & English, Meaning: Taking action toward real solutions)</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-8 shadow-sm border">
                <h2 className="text-xl font-bold text-center mb-2">DO</h2>
                <p className="text-center">Action, making things happen.</p>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-sm border">
                <h2 className="text-xl font-bold text-center mb-2">UPAYA</h2>
                <p className="text-center">A skillful means, an effective method, a path toward a goal.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 - The Problem / Why We Exist */}
      <section className="w-full bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Changemakers in action" 
                className="rounded-lg object-cover h-full w-full"
              />
            </div>
            <div className="order-1 lg:order-2 flex flex-col justify-center">
              <h2 className={`${TYPOGRAPHY.section} text-gray-900 mb-8`}>
                We believe supporting impact should feel personal, powerful — and actually work.
              </h2>
              
              <div className={`${TYPOGRAPHY.body} text-gray-700`}>
                <p>
                  We started Dopaya because we were frustrated by how broken the world of impact felt. Billions are invested in social causes every year, but so much of it gets lost in overhead or unclear processes.<br/>
                  Meanwhile, incredible social entrepreneurs struggle to get awareness, access to small amounts of funding that could change lives sustainably.<br/>
                  What if we could make supporting impact feel more like building something real?<br/>
                  More transparent. More joyful. And more connected to outcomes — not just promises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2.6 - Why Social Enterprises */}
      <SESpectrumSlider />

      {/* SECTION 2.5 - Better Way Vision - Full Width Orange */}
      <section className="w-full bg-[#f2662d] py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-left">
            <h2 className={`${TYPOGRAPHY.section} mb-12`}>
              Building the most transparent, rewarding, and community-led impact platform.
            </h2>
            
            <div className="text-xl leading-relaxed">
              <p>
                We believe a better way is possible — and people-powered. Where every dollar is tracked. Every result is visible. And everyone who supports becomes part of the impact story. Dopaya isn't just about mobilizing capital. It's an ecosystem where contributions are rewarded, changemakers are empowered, and support sparks long-term impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* SECTION 3 - Why Dopaya Is Different */}
        <section className="w-full bg-white py-24">
          <div className="container mx-auto px-4">
            <h2 className={`${TYPOGRAPHY.section} text-gray-900 text-center mb-16`}>
              Our approach to impact
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
              {/* Transparent by Design */}
              <div className="text-center p-8 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-6">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Transparent by Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track every dollar and impact outcome live on your dashboard.
                </p>
              </div>
              
              {/* Built Around People */}
              <div className="text-center p-8 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-6">🤝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Built Around People</h3>
                <p className="text-gray-600 leading-relaxed">
                  We fund vetted social enterprises with strong founder missions — not vague causes.
                </p>
              </div>
              
              {/* Giving = Earning */}
              <div className="text-center p-8 rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:scale-105">
                <div className="text-4xl mb-6">🎁</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Giving = Earning</h3>
                <p className="text-gray-600 leading-relaxed">
                  Earn rewards, badges, and Impact Points for supporting change.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* SECTION 5 - Team */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-10">
              <h2 className={`${TYPOGRAPHY.section} mb-4`}>The community behind Dopaya</h2>
              <p className={`${TYPOGRAPHY.body} text-gray-600`}>No fancy titles. Just dedication.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
              {[
                { 
                  name: "Patrick", 
                  role: "Impact Contributor & Platform Creator",
                  image: patrickWidmannImage,
                  quote: "Believes in impact at scale"
                },
                { 
                  name: "Abdul", 
                  role: "Impact Contributor", 
                  image: abdulMujeebImage,
                  quote: "Passionate about sustainable change"
                },
                { 
                  name: "Shalini", 
                  role: "Impact Contributor", 
                  image: shaliniSinghImage,
                  quote: "Connecting ecosystems and brands"
                },
                { 
                  name: "Tarun", 
                  role: "Impact Partner", 
                  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                  quote: "Technology for social good"
                },
                { 
                  name: "Cursor", 
                  role: "Tech Enabler", 
                  image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                  quote: "Responsible to make the platform work"
                },
                { 
                  name: "n8n", 
                  role: "Automation Partner", 
                  image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                  quote: "Streamlining operations and workflows"
                },
                { 
                  name: "Replit", 
                  role: "Development Platform", 
                  image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                  quote: "Enabling rapid development and deployment"
                },
              ].map((member, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm border">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-32 md:h-48 object-cover object-top"
                  />
                  <div className="p-4">
                    <h3 className="font-bold">{member.name}</h3>
                    <p className="text-[#f2662d] text-sm font-medium">{member.role}</p>
                    <p className="text-gray-600 text-xs mt-1 italic">"{member.quote}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 - Final CTA Block */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="text-center bg-[#f2662d] py-12 px-6 rounded-lg text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Ready to join our founding member community?</h2>
              <p className="text-lg mb-6 text-orange-100">Be part of the first 1,000 supporters who help us prove this model works</p>
              <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-[#f2662d] hover:bg-gray-50">
                  Become a Founding Member
                </Button>
              </a>
            </div>
          </div>
        </section>
      </div>
      </div>
    </>
  );
}