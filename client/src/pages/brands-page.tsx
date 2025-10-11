import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, Gift, BarChart, Users, LineChart, CreditCard, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo/seo-head";

// Import brand logos
import milletarianLogo from "@assets/milletarian.png";
import adithiMilletsLogo from "@assets/adithi-millets.png";
import allikaLogo from "@assets/allika.png";
import khadyamLogo from "@assets/khadyam.png";
import sankalpaArtVillageLogo from "@assets/sankalpa-art-village.png";
import amazonLogo from "@assets/amazon.png";
import flipkartLogo from "@assets/flipkart.png";
import bonjiLogo from "@assets/Bonji - beyond just natural.png";

export default function BrandsPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const cardHover = {
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.3 }
  };

  // Define brand logos with their alt text
  const brandLogos = [
    { src: milletarianLogo, alt: "Milletarian" },
    { src: adithiMilletsLogo, alt: "Adithi Millets" },
    { src: allikaLogo, alt: "Allika" },
    { src: khadyamLogo, alt: "Khadyam" },
    { src: sankalpaArtVillageLogo, alt: "Sankalpa Art Village" },
    { src: amazonLogo, alt: "Amazon" },
    { src: flipkartLogo, alt: "Flipkart" },
    { src: bonjiLogo, alt: "Bonji" },
  ];

  return (
    <>
      <SEOHead
        title="For Brands | Partner with Dopaya | Social Impact Marketing Platform"
        description="Partner with Dopaya to reach conscious consumers and support social enterprises. Offer exclusive rewards, build brand loyalty, and make a real impact in the social enterprise ecosystem."
        keywords="brand partnerships, social impact marketing, conscious consumers, sustainable brands, social enterprise partnerships, impact marketing, brand loyalty, social responsibility"
        canonicalUrl="https://dopaya.org/brands"
        ogType="website"
        ogImage="https://dopaya.org/og-brands.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Brand Partnership Program",
          "description": "Partner with Dopaya to reach conscious consumers and support social enterprises",
          "provider": {
            "@type": "Organization",
            "name": "Dopaya"
          },
          "serviceType": "Marketing Partnership",
          "areaServed": "Global"
        }}
      />
      
      <div className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Reward customers for doing good — while growing your brand.
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Join a new ecosystem where donations unlock your rewards.
              </p>
              <a href="https://tally.so/r/3lvVg5" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#F05304] hover:bg-[#d43d25] text-white px-8 py-6 text-lg rounded-md w-full sm:w-auto">
                  Become a Brand Partner
                </Button>
              </a>
            </div>
            <div className="lg:w-1/2">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="bg-white rounded-xl shadow-xl p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Reward Dashboard</h3>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Active
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">BookMyShow 15% Discount</span>
                    <span className="font-medium text-[#F05304]">800 points</span>
                  </div>
                  <div className="h-2.5 w-full bg-gray-200 rounded-full">
                    <div className="h-2.5 rounded-full bg-[#F05304] w-3/4"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Redemptions</p>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">247</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">New Customers</p>
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">108</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-1.5 rounded mr-3">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm">Audience Reach</span>
                    </div>
                    <span className="font-medium">12,500+</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-1.5 rounded mr-3">
                        <BarChart className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm">Engagement Rate</span>
                    </div>
                    <span className="font-medium">24.3%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-1.5 rounded mr-3">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm">Customer LTV</span>
                    </div>
                    <span className="font-medium">+37%</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.div 
              variants={item}
              whileHover={cardHover}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-red-100 w-14 h-14 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F05304]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Loyalty programs feel disconnected?</h3>
              <p className="text-gray-600">
                Connect with purpose-driven customers who engage more deeply with your brand through meaningful rewards.
              </p>
            </motion.div>

            <motion.div 
              variants={item}
              whileHover={cardHover}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-yellow-100 w-14 h-14 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F05304]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Struggling to show purpose beyond CSR?</h3>
              <p className="text-gray-600">
                Turn marketing into meaningful impact by engaging directly with customers who share your values.
              </p>
            </motion.div>

            <motion.div 
              variants={item}
              whileHover={cardHover}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-green-100 w-14 h-14 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F05304]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Looking for lasting impact with real ROI?</h3>
              <p className="text-gray-600">
                Track measurable outcomes from your purpose-driven marketing with transparent data and customer insights.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works (3-step Graphic) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to connect with purpose-driven customers through your rewards
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 hidden md:block"></div>
            <div className="grid md:grid-cols-3 gap-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative bg-white rounded-xl shadow-md p-6 border border-gray-100 z-10"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F05304] w-12 h-12 flex items-center justify-center text-white font-bold text-lg">1</div>
                <div className="text-center pt-6">
                  <div className="rounded-full bg-orange-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-8 w-8 text-[#F05304]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Add your reward</h3>
                  <p className="text-gray-600">
                    Offer exclusive discounts, freebies, or experiences that your brand can provide to socially conscious customers.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative bg-white rounded-xl shadow-md p-6 border border-gray-100 z-10"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F05304] w-12 h-12 flex items-center justify-center text-white font-bold text-lg">2</div>
                <div className="text-center pt-6">
                  <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Donors unlock it</h3>
                  <p className="text-gray-600">
                    As users donate to social enterprises, they earn Impact Points that can be redeemed for your rewards.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="relative bg-white rounded-xl shadow-md p-6 border border-gray-100 z-10"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F05304] w-12 h-12 flex items-center justify-center text-white font-bold text-lg">3</div>
                <div className="text-center pt-6">
                  <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BarChart className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">You gain visibility</h3>
                  <p className="text-gray-600">
                    Showcase your brand to engaged, socially conscious consumers while building meaningful connections through purpose-driven rewards.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Benefits for Your Brand</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dopaya creates a win-win-win for brands, donors, and social enterprises
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mb-6">
                <BarChart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trackable Impact</h3>
              <p className="text-gray-600">
                Get clear metrics on how your brand is driving social change, with data on donations influenced and projects supported.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="rounded-full bg-pink-100 w-16 h-16 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer Loyalty</h3>
              <p className="text-gray-600">
                Deepen relationships with customers who align with your brand's values and encourage repeat business.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="rounded-full bg-purple-100 w-16 h-16 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Brand Visibility</h3>
              <p className="text-gray-600">
                Showcase your brand to an engaged audience of socially conscious consumers actively looking for purpose-driven companies.
              </p>
            </motion.div>
          </div>
        </div>
      </section>



      {/* Brand Logos */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Brands Like These</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join the growing community of purpose-driven companies on our platform
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brandLogos.map((logo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-[#F9F9F9] rounded-md p-6 flex items-center justify-center h-32 transition-all duration-300"
              >
                <img 
                  src={logo.src} 
                  alt={logo.alt}
                  className="h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Let your brand be part of the change.</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="https://tally.so/r/3lvVg5" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#F05304] hover:bg-[#d43d25] text-white px-8 py-6 text-lg rounded-md w-full sm:w-auto">
                  Become a Brand Partner
                </Button>
              </a>
              <Link href="/contact">
                <Button variant="outline" className="px-8 py-6 text-lg w-full sm:w-auto">
                  Let's Talk
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 py-3 px-4 z-50 md:hidden">
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-800">Ready to partner with us?</p>
          <Link href="/contact">
            <Button size="sm" className="bg-[#F05304] hover:bg-[#d43d25] text-white w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}