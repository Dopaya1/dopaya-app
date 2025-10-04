import { SEOHead } from "@/components/seo/seo-head";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Check, X, Users, Eye, Gift, Heart } from "lucide-react";
import sdgWheelImage from "@assets/sdg wheel.png";
import patrickWidmannImage from "@assets/Patrick Widmann_1749545204060.png";
import abdulMujeebImage from "@assets/Abdul Mujeeb_1749476510704.png";
import shaliniSinghImage from "@assets/Shalini Singh_1749476510708.png";

export default function AboutPageV2() {
  return (
    <>
      <SEOHead
        title="About Us"
        description="Learn about Dopaya - building the most transparent, efficient and engaging giving platform for social impact. Meet our team and discover our mission."
        keywords="about Dopaya, social impact platform, mission, team, transparent giving, impact platform founders"
        canonicalUrl="https://dopaya.org/about"
      />

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* SECTION 1 - Name Meaning (Keep as-is) */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#e94e35] mb-4">[du·pa·ya]</h1>
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

        {/* SECTION 2 - The Problem / Why We Exist - Full Width White Background */}
      </div>
      
      <section className="w-full bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
                alt="Changemakers in action" 
                className="rounded-lg object-cover h-full w-full"
              />
            </div>
            <div className="order-1 lg:order-2 flex flex-col justify-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                We believe donations should feel personal, powerful — and actually work.
              </h2>
              
              <div className="text-lg leading-relaxed text-gray-700">
                <p>
                  We started Dopaya because we were frustrated by how broken the world of impact felt. Billions are donated every year, but so much of it gets lost in overhead or unclear processes.<br/>
                  Meanwhile, incredible social entrepreneurs struggle to get awareness, access to small amounts of funding  that could change lives sustainably.<br/>
                  What if we could make giving feel more like building something real?<br/>
                  More transparent. More joyful. And more connected to outcomes — not just promises.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* SECTION 2.5 - Better Way Vision - Full Width Orange Background */}
      <section className="w-full bg-[#e94e35] py-16 md:py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Building the most transparent, rewarding, and community-led giving platform.
            </h2>
            
            <div className="text-xl leading-relaxed">
              <p>
                We believe a better way is possible — and people-powered. Where every dollar is tracked. Every result is visible. And everyone who gives becomes part of the impact story. Dopaya isn't just about raising funds. It's an ecosystem where generosity is rewarded, changemakers are empowered, and donations spark long-term impact.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* SECTION 3 - Why Dopaya Is Different - 3 Column Layout */}
      <section className="w-full bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            Why Dopaya Is Different
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
      
      <div className="container mx-auto px-4 py-12 md:py-16">

        {/* SECTION 6 - Team (Updated Titles) */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The community behind Dopaya</h2>
            <p className="text-lg text-gray-600">No fancy titles. Just dedication.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {[
              { 
                name: "Patrick Widmann", 
                role: "Impact Partner",
                image: patrickWidmannImage,
                quote: "Believes in impact at scale"
              },
              { 
                name: "Abdul Mujeeb", 
                role: "Impact Partner", 
                image: abdulMujeebImage,
                quote: "Passionate about sustainable change"
              },
              { 
                name: "Shalini Singh", 
                role: "Impact Partner", 
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
                name: "Replit", 
                role: "Tech Enabler", 
                image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                quote: "Responsible to make all the content visible"
              },
              { 
                name: "n8n", 
                role: "Tech Enabler", 
                image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
                quote: "Enabling automation through technology"
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
                  <p className="text-[#e94e35] text-sm font-medium">{member.role}</p>
                  <p className="text-gray-600 text-xs mt-1 italic">"{member.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7 - Final CTA Block */}
        <div className="text-center bg-[#e94e35] py-12 px-6 rounded-lg text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Want to co-build the Dopaya ecosystem with us?</h2>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-[#e94e35] hover:bg-gray-50">
              Join the Community
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}