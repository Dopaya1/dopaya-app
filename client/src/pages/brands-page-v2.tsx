import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ProgressSlider,
  SliderContent,
  SliderWrapper,
  SliderBtnGroup,
  SliderBtn,
} from "@/components/ui/progressive-carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Gift, 
  BarChart, 
  Users, 
  LineChart, 
  CreditCard, 
  TrendingUp,
  CheckCircle,
  Star,
  Heart,
  Leaf,
  Target,
  Zap,
  Globe,
  Shield,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import { SEOHead } from "@/components/seo/seo-head";
import { BRAND_COLORS } from "@/constants/colors";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";

// SDG Images
import sdg8Icon from "@assets/SDG-Goal-08.png";
import sdg12Icon from "@assets/SDG-Goal-12.png";
import sdg17Icon from "@assets/SDG-Goal-17.png";
import { supabase } from "@/lib/supabase";
import { TextRotate } from "@/components/ui/text-rotate";
import SphereImageGrid from "@/components/ui/image-sphere";
import { ImageComparisonSlider } from "@/components/ui/image-comparison-slider-horizontal";
import ExpandableGallery from "@/components/ui/gallery-animation";
import { getLogoUrl } from "@/lib/image-utils";
import type { Brand } from "@shared/schema";

// Import Conscious consumer image - using fallback for now to ensure page loads
// import consciousConsumerImg from "@/assets/Conscious consumer.jpg";

// Import brand logos
import milletarianLogo from "@assets/Brand_backers/milletarian sustainable brand - logo.png";
import adithiMilletsLogo from "@assets/Brand_backers/adithi-millets sustainable brand - logo.png";
import allikaLogo from "@assets/Brand_backers/allika sustainable brand - logo.png";
import sankalpaArtVillageLogo from "@assets/Brand_backers/sankalpa-art-village sustainable brand - logo.png";
import amazonLogo from "@assets/Brand_backers/amazon.png";
import flipkartLogo from "@assets/Brand_backers/flipkart.png";
import bonjiLogo from "@assets/Brand_backers/Bonji sustainable brand - logo.png";
import aaparLogo from "@assets/Brand_backers/Aapar sustainable brand - logo.png";
import syangsLogo from "@assets/Syangs logo_1750646598029.png";
// Local carousel background images (URL imports for Vite)
import brands1Url from "@/assets/brands-1.jpg?url";
import brands2Url from "@/assets/brands-2.jpg?url";
import brands3Url from "@/assets/brands-3.jpg?url";


export default function BrandsPageV2() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPartnerCount, setCurrentPartnerCount] = useState(47);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    // Simulate partner count growth
    const interval = setInterval(() => {
      setCurrentPartnerCount(prev => Math.min(prev + 1, 100));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch active rewards (products) from Supabase
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["rewards-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('pointsCost', { ascending: true })
        .limit(15); // Get more products to ensure we have at least 10
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch brands from Supabase (only featured brands)
  const { data: brands = [], isLoading: brandsLoading, error: brandsError } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('featured', true)  // Only get featured brands
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching brands:', error);
          return []; // Return empty array on error instead of throwing
        }
        return (data || []) as Brand[];
      } catch (err) {
        console.error('Exception fetching brands:', err);
        return []; // Return empty array on exception
      }
    },
  });

  // Auto-scroll effect for products
  useEffect(() => {
    const productsContainer = projectsRef.current;
    if (!productsContainer || !products.length) return;

    const scroll = () => {
      if (productsContainer.scrollLeft >= productsContainer.scrollWidth - productsContainer.clientWidth) {
        productsContainer.scrollLeft = 0;
      } else {
        productsContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [products]);

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

  // Map brands from Supabase to logo URLs with fallbacks
  // Create a mapping of brand names to fallback logos for backward compatibility
  const fallbackLogos: Record<string, string> = {
    "Milletarian": milletarianLogo,
    "Adithi Millets": adithiMilletsLogo,
    "Allika": allikaLogo,
    "Sankalpa Art Village": sankalpaArtVillageLogo,
    "Sankalpa": sankalpaArtVillageLogo,
    "Amazon": amazonLogo,
    "Flipkart": flipkartLogo,
    "Bonji": bonjiLogo,
    "Bonji - Beyond just natural": bonjiLogo, // Handle full name
    "Aapar": aaparLogo,
    "Syangs": syangsLogo,
  };

  // Helper function to find fallback logo with flexible matching
  const findFallbackLogo = (brandName: string): string | undefined => {
    // First try exact match
    if (fallbackLogos[brandName]) {
      return fallbackLogos[brandName];
    }
    
    // Then try case-insensitive partial matching
    const lowerName = brandName.toLowerCase();
    for (const [key, logo] of Object.entries(fallbackLogos)) {
      if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
        return logo;
      }
    }
    
    // Special cases
    if (lowerName.includes('bonji')) return bonjiLogo;
    if (lowerName.includes('syangs')) return syangsLogo;
    
    return undefined;
  };

  // Get brand logos from Supabase, with fallback to hardcoded imports
  // Note: Supabase returns snake_case, so we need to access logo_path, not logoPath
  const brandLogos = brands.length > 0 
    ? brands.map(brand => {
        // Supabase returns snake_case, so access logo_path directly
        // TypeScript type says logoPath, but actual data has logo_path
        const logoPath = (brand as any).logo_path || brand.logoPath;
        
        // Debug: Log the raw brand data
        console.log(`Processing brand "${brand.name}":`, {
          logo_path: (brand as any).logo_path,
          logoPath: brand.logoPath,
          logoPathType: typeof logoPath,
          logoPathLength: logoPath?.length,
          rawBrand: brand
        });
        
        const logoUrl = getLogoUrl(logoPath, findFallbackLogo(brand.name));
        const finalSrc = logoUrl || findFallbackLogo(brand.name) || '';
        
        // Debug logging
        console.log(`Brand "${brand.name}" - logoUrl: ${logoUrl}, finalSrc: ${finalSrc}`);
        
        if (!finalSrc) {
          console.warn(`Brand "${brand.name}" has no logo (logo_path: ${logoPath || 'empty'})`);
        }
        
        return {
          src: finalSrc,
          alt: brand.name,
          name: brand.name,
        };
      }).filter(logo => logo.src) // Filter out brands without logos
    : [
        // Fallback to hardcoded logos if no brands in database
        { src: milletarianLogo, alt: "Milletarian", name: "Milletarian" },
        { src: adithiMilletsLogo, alt: "Adithi Millets", name: "Adithi Millets" },
        { src: allikaLogo, alt: "Allika", name: "Allika" },
        { src: bonjiLogo, alt: "Bonji", name: "Bonji" },
        { src: aaparLogo, alt: "Aapar", name: "Aapar" },
        { src: sankalpaArtVillageLogo, alt: "Sankalpa Art Village", name: "Sankalpa Art Village" },
      ];

  // Debug: Log how many brands we have
  useEffect(() => {
    if (brands.length > 0) {
      console.log(`Total brands from Supabase: ${brands.length}`);
      console.log(`Brands with logos: ${brandLogos.length}`);
      console.log('Brands data:', brands.map(b => ({ name: b.name, logoPath: b.logoPath, featured: b.featured })));
    }
  }, [brands, brandLogos.length]);

  // Dynamic rotating words for hero
  const rotatingWords = ["sustainable", "eco-friendly", "ethical", "conscious", "impact-driven"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SEOHead
        title="For Sustainable Brands | FREE Partnership | Dopaya"
        description="Join 50+ sustainable brands creating measurable impact while reaching conscious consumers. 100% FREE partnership for values-aligned brands with first mover advantages."
        keywords="sustainable brands, free partnership, conscious consumers, eco-friendly brands, social impact, brand partnerships, sustainability, ethical brands"
        canonicalUrl="https://dopaya.com/brands"
        ogType="website"
        ogImage="https://dopaya.com/og-brands.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "FREE Sustainable Brand Partnership Program",
          "description": "Join sustainable brands creating measurable impact while reaching conscious consumers",
          "provider": {
            "@type": "Organization",
            "name": "Dopaya"
          },
          "serviceType": "FREE Brand Partnership",
          "areaServed": "Global"
        }}
      />
      
      <div className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Hero Section */}
        <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="lg:w-1/2 text-center lg:text-left">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4"
                >
                  Reward customers for doing good, while{" "}
                  <TextRotate
                    texts={["growing", "expanding", "scaling", "building", "strengthening"]}
                    rotationInterval={3000}
                    mainClassName="inline-block text-orange-500 bg-white px-2 py-1 rounded-md"
                  />
                  {" "}your brand.
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-xl text-gray-700 mb-6"
                >
                  Join a new ecosystem where support of social enterprises unlock your rewards.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4 }}
                  className="flex justify-center lg:justify-start"
                >
                  <a href="https://tally.so/r/3lvVg5" target="_blank" rel="noopener noreferrer">
                    <Button 
                      className="px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                    >
                      Become Brand Partner
                    </Button>
                  </a>
                </motion.div>
              </div>
              <div className="lg:w-1/2">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className="bg-white rounded-xl shadow-xl p-6 border border-gray-100"
                >
                  
                  {/* Products Section */}
                  <div className="mb-8">
                    <div 
                      ref={projectsRef}
                      className="flex gap-3 overflow-x-hidden"
                    >
                      {products.length > 0 ? (
                        products.map((product: any, index: number) => (
                          <div key={product.id} className="group hover:scale-105 transition-transform duration-200 relative flex-shrink-0 w-1/2 lg:w-1/4">
                            <img 
                              src={product.imageUrl || 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                              alt={product.title} 
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute bottom-2 left-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                product.category === 'Merchandise' ? 'bg-blue-100 text-blue-800' :
                                product.category === 'Experience' ? 'bg-purple-100 text-purple-800' :
                                product.category === 'Food' ? 'bg-green-100 text-green-800' :
                                product.category === 'Gift Card' ? 'bg-yellow-100 text-yellow-800' :
                                product.category === 'Technology' ? 'bg-indigo-100 text-indigo-800' :
                                product.category === 'Fashion' ? 'bg-pink-100 text-pink-800' :
                                product.category === 'Beauty' ? 'bg-rose-100 text-rose-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {product.category}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        // Fallback products if database is empty
                        [
                          { id: '1', name: 'Organic Food', category: 'Sustainable', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop&crop=center' },
                          { id: '2', name: 'Eco Fashion', category: 'Ethical', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop&crop=center' },
                          { id: '3', name: 'Clean Beauty', category: 'Natural', imageUrl: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=200&h=200&fit=crop&crop=center' },
                          { id: '4', name: 'Green Tech', category: 'Innovative', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center' }
                        ].map((product: any, index: number) => (
                          <div key={product.id} className="group hover:scale-105 transition-transform duration-200 relative flex-shrink-0 w-1/2 lg:w-1/4">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <div className="absolute bottom-2 left-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                product.category === 'Sustainable' ? 'bg-green-100 text-green-800' :
                                product.category === 'Ethical' ? 'bg-purple-100 text-purple-800' :
                                product.category === 'Natural' ? 'bg-pink-100 text-pink-800' :
                                product.category === 'Innovative' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {product.category}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Benefits Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Target className="h-6 w-6 text-gray-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">Environmental Impact</p>
                      <p className="text-xs text-gray-600">Measured</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-gray-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">Social Impact</p>
                      <p className="text-xs text-gray-600">Tracked</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-gray-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">Shared Values</p>
                      <p className="text-xs text-gray-600">Essential</p>
                    </div>
                  </div>
                  
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section - Infinite Slider */}
        <section className="py-4" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Infinite Logo Slider */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative overflow-hidden"
            >
              {brandsError ? (
                <div className="flex items-center justify-center h-12">
                  <div className="text-red-500 text-sm">Error loading brands. Check console.</div>
                </div>
              ) : brandsLoading ? (
                <div className="flex items-center justify-center h-12">
                  <div className="text-gray-400 text-sm">Loading brands...</div>
                </div>
              ) : brandLogos.length > 0 ? (
                <div className="flex animate-scroll">
                  {/* First set of logos */}
                  <div className="flex items-center space-x-6 flex-shrink-0 pl-6">
                    {brandLogos.map((logo, index) => (
                      <div key={`${logo.name}-first-${index}`} className="flex items-center justify-center h-12 w-32">
                        <img 
                          src={logo.src} 
                          alt={logo.alt} 
                          className="max-h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" 
                        />
                      </div>
                    ))}
                  </div>
                  {/* Duplicate set for seamless loop */}
                  <div className="flex items-center space-x-6 flex-shrink-0">
                    {brandLogos.map((logo, index) => (
                      <div key={`${logo.name}-second-${index}`} className="flex items-center justify-center h-12 w-32">
                        <img 
                          src={logo.src} 
                          alt={logo.alt} 
                          className="max-h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-12">
                  <div className="text-gray-400 text-sm">No brands available</div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* The Ecosystem is Broken - Progressive Carousel */}
        <section className="py-24" style={{ backgroundColor: '#FFFDF9' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                The impact economy is growing. But brands are losing the trust that fuels it.
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                Sustainability investments are at record highs, yet consumers still question authenticity, and loyalty remains fragile. Here's what's broken in the system — and why it matters for your brand.
              </p>
            </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
            >
              <ProgressSlider 
                vertical={false} 
                activeSlider="scale"
                duration={6000}
                className="rounded-2xl overflow-hidden shadow-2xl"
                aria-label="Ecosystem insight carousel"
              >
                <SliderContent>
                  {/* SLIDE 1 — Capital */}
                  <SliderWrapper value="scale">
                    <div className="relative w-full h-[500px] md:h-[600px]">
                      <img
                        src={brands1Url}
                        alt="Social Economy Scale"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#FF6701] opacity-30"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent flex items-end justify-start">
                        <div className="p-8 md:p-12 pb-32 md:pb-36 text-white text-left max-w-4xl">
                          <div className="text-6xl md:text-7xl font-bold mb-4">$2T+</div>
                          <p className="text-xl md:text-2xl leading-relaxed mb-4">
                            The global social economy exceeds $2 trillion — yet most social enterprises can't access patient capital to scale measurable change.
                          </p>
                          <p className="text-sm text-gray-300 mt-6">
                            Source: OECD Social Economy Outlook, 2023
                          </p>
                </div>
                </div>
                </div>
                  </SliderWrapper>

                  {/* SLIDE 2 — TRUST */}
                  <SliderWrapper value="trust">
                    <div className="relative w-full h-[500px] md:h-[600px]">
                      <img
                        src={brands2Url}
                        alt="Consumer Trust"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#FF6701] opacity-30"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent flex items-end justify-start">
                        <div className="p-8 md:p-12 pb-32 md:pb-36 text-white text-left max-w-4xl">
                          <div className="text-6xl md:text-7xl font-bold mb-4">91%</div>
                          <p className="text-xl md:text-2xl leading-relaxed mb-4">
                            91% of consumers suspect greenwashing — people want proof, not promises.
                          </p>
                          <p className="text-sm text-gray-300 mt-6">
                            Source: WhatTheyThink / 2023
                          </p>
                </div>
            </div>
                    </div>
                  </SliderWrapper>

                  {/* SLIDE 3 — LOYALTY */}
                  <SliderWrapper value="loyalty">
                    <div className="relative w-full h-[500px] md:h-[600px]">
                      <img
                        src={brands3Url}
                        alt="Loyalty Programs"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#FF6701] opacity-30"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent flex items-end justify-start">
                        <div className="p-8 md:p-12 pb-32 md:pb-36 text-white text-left max-w-4xl">
                          <div className="text-6xl md:text-7xl font-bold mb-4">83%</div>
                          <p className="text-xl md:text-2xl leading-relaxed mb-4">
                            83% of consumers say loyalty programs influence repeat purchases — but only when programs reflect personal values and authentic impact.
                          </p>
                          <p className="text-sm text-gray-300 mt-6">
                            Source: Queue-it, 2024
                          </p>
              </div>
            </div>
          </div>
                  </SliderWrapper>

                  {/* SLIDE 4 — GROWTH */}
                  <SliderWrapper value="growth">
                    <div className="relative w-full h-[500px] md:h-[600px]">
                      <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                        alt="Sustainable Growth"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent flex items-end justify-start">
                        <div className="p-8 md:p-12 pb-32 md:pb-36 text-white text-left max-w-4xl">
                          <div className="text-6xl md:text-7xl font-bold mb-4">+28%</div>
                          <p className="text-xl md:text-2xl leading-relaxed mb-4">
                            Products with ESG-related claims grew 28% faster over the past five years — authenticity and measurable impact are competitive advantages.
                          </p>
                          <p className="text-sm text-gray-300 mt-6">
                            Source: McKinsey & NielsenIQ, 2023
                          </p>
                      </div>
                      </div>
                    </div>
                  </SliderWrapper>
                </SliderContent>

                <SliderBtnGroup className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md overflow-hidden grid grid-cols-2 md:grid-cols-4 border-t border-gray-200 dark:border-gray-700">
                  <SliderBtn
                    value="scale"
                    className="text-left cursor-pointer p-6 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    progressBarClass="bg-[#f2662d] h-full"
                  >
                    <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">
                      Capital
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Trillions exist — but impact stays out of reach
                    </p>
                  </SliderBtn>

                  <SliderBtn
                    value="trust"
                    className="text-left cursor-pointer p-6 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    progressBarClass="bg-[#f2662d] h-full"
                  >
                    <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">
                      Trust
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Consumers want proof, not promises
                    </p>
                  </SliderBtn>

                  <SliderBtn
                    value="loyalty"
                    className="text-left cursor-pointer p-6 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    progressBarClass="bg-[#f2662d] h-full"
                  >
                    <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">
                      Loyalty
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Real loyalty starts with shared values
                    </p>
                  </SliderBtn>

                  <SliderBtn
                    value="growth"
                    className="text-left cursor-pointer p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    progressBarClass="bg-[#f2662d] h-full"
                  >
                    <h3 className="font-semibold text-base mb-1 text-gray-900 dark:text-white">
                      Growth
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Authenticity is a market advantage
                    </p>
                  </SliderBtn>
                </SliderBtnGroup>
              </ProgressSlider>
            </motion.div>
                    </div>
        </section>

        {/* Impact Sphere Section - NEW VERSION */}
        <section className="py-16" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
          {/* Headline and subheadline at top, centered */}
          <div className="max-w-3xl mx-auto px-4 text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-5">
              Like a loyalty program — but for impact that grows your brand.
            </h2>
            <p className="text-xl text-gray-600">
              Turn every act of good into measurable brand growth. Dopaya connects purpose-driven consumers, sustainable brands, and social enterprises through a verified reward ecosystem that converts impact into advocacy.
                      </p>
                    </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Column - Only the three cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* Three Visual Cards */}
                <div className="space-y-4">
                  {/* Reach Card */}
                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mr-4 flex-shrink-0">
                        <Users className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reach conscious consumers who buy with purpose</h3>
                        <p className="text-gray-600 text-sm mb-1">
                          64% of global consumers choose brands aligned with their values.
                        </p>
                        <p className="text-gray-500 text-xs">
                          (Edelman Trust Barometer, 2023)
                    </p>
                  </div>
                    </div>
                    </div>

                  {/* Build Card */}
                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mr-4 flex-shrink-0">
                        <Heart className="h-6 w-6 text-orange-500" />
                    </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Build measurable, impact-driven loyalty</h3>
                        <p className="text-gray-600 text-sm">
                          Reward your customers for supporting social enterprises — turning purchases into positive outcomes your brand can prove and share.
                        </p>
                    </div>
                    </div>
                  </div>

                  {/* Grow Card */}
                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mr-4 flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-orange-500" />
                    </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Turn impact into influence.</h3>
                        <p className="text-gray-600 text-sm">
                          Every verified action your customers take becomes a story worth sharing — one that builds trust, loyalty, and growth around your brand.
                        </p>
                  </div>
                  </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column - Gallery above process explanation */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col gap-8 justify-center items-center"
              >
                {/* Gallery Images */}
                <ExpandableGallery
                        images={(() => {
                    // Prefer an Ignis Careers product image from Supabase
                    const toLower = (v: any) => (typeof v === 'string' ? v.toLowerCase() : '');
                    const ignisProduct = (products || []).find((p: any) => {
                      const t = toLower(p?.title);
                      const d = toLower(p?.description);
                      return t.includes('ignis') || t.includes('career') || d.includes('ignis') || d.includes('career');
                    });

                    // Fallback: first product with an imageUrl
                    const firstWithImage = (products || []).find((p: any) => Boolean(p?.imageUrl));

                    // Image 1: Conscious consumer asset from public folder
                    const image1 = '/conscious-consumer.jpg';

                    // Image 2: Use Ignis Careers if available; otherwise first product with image; otherwise fallback
                    const image2 = ignisProduct?.imageUrl
                      || firstWithImage?.imageUrl
                      || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1200&auto=format&fit=crop';

                    // Image 3: Keep as is (any other available product image or fallback)
                    const image3 = (products || []).find((p: any) => p?.imageUrl && p !== ignisProduct && p !== firstWithImage)?.imageUrl
                      || (products?.[0]?.imageUrl)
                      || 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=1200&auto=format&fit=crop';

                    return [image1, image2, image3];
                        })()}
                  taglines={[
                    'Consumers: Support verified impact projects',
                    'Social Enterprises: Receive funds and visibility',
                    'Brands: Reward loyalty and earn advocacy'
                  ]}
                  className="w-full max-w-xl"
                />
                {/* 3-step process explanation UNDER the gallery (aligned per image) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 w-full">
                  {/* Step 1 */}
                  <div className="text-center">
                    <div className="inline-block text-[11px] md:text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded mb-2">
                      Step 1
                        </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-snug">
                      Consumers support verified<br/>social enterprises
                    </p>
                      </div>
                  {/* Step 2 */}
                  <div className="text-center">
                    <div className="inline-block text-[11px] md:text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded mb-2">
                      Step 2
                        </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-snug">
                      They earn impact points<br/>redeemable with partner brands
                    </p>
                      </div>
                  {/* Step 3 */}
                  <div className="text-center">
                    <div className="inline-block text-[11px] md:text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded mb-2">
                      Step 3
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-snug">
                      Brands gain measurable<br/>visibility, loyalty, and trust
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Partner with us to create meaningful impact through conscious consumer connections
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Join Dopaya’s coalition of purpose-driven brands creating measurable change.
              </p>
            </motion.div>

            {/* Centered CTA + Benefits */}
            <div className="text-center mb-10">
              <a href="https://tally.so/r/3lvVg5" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#F05304] text-white hover:bg-[#e14c03] px-8 py-6 text-lg rounded-md">
                  Become a Brand Partner
                </Button>
              </a>
                </div>

            {/* Benefits removed per request */}

            <p className="text-sm text-gray-600 text-center mt-6">
              Already trusted by early impact pioneers across fashion, wellness, and lifestyle sectors.
            </p>

            <div className="mt-12">
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Free partnership forever</h4>
                  <p className="text-gray-600 text-sm">No platform fees, ever. We only succeed when you succeed</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Values-aligned customers</h4>
                  <p className="text-gray-600 text-sm">Connect with conscious consumers who share your mission and values</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">Shared impact mission</h4>
                  <p className="text-gray-600 text-sm">Join a coalition of brands working together to create positive social and environmental impact</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission — The Bigger Picture */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">We’re building the world’s first impact rewards ecosystem aligned with the UN Global Goals.</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              Every Dopaya partnership contributes directly to measurable progress across Decent Work, Sustainable Production, and Global Partnerships.
              </p>
            </motion.div>
            {/* Boxes removed per request */}
            {/* <div className="grid md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="mb-8 relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img src={sdg8Icon} alt="SDG 8" className="w-24 h-24 object-contain" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SDG 8
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Decent Work & Economic Growth</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Promoting sustained, inclusive economic growth and productive employment for all
              </p>
            </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                className="text-center group"
                >
                <div className="mb-8 relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img src={sdg12Icon} alt="SDG 12" className="w-24 h-24 object-contain" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SDG 12
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Responsible Consumption & Production</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Ensuring sustainable consumption and production patterns for a better future
                </p>
                </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="mb-8 relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <img src={sdg17Icon} alt="SDG 17" className="w-24 h-24 object-contain" />
            </div>
                  <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SDG 17
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Partnerships for Goals</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Strengthening partnerships to achieve sustainable development goals together
                </p>
              </motion.div>
            </div> */}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about partnering with Dopaya
              </p>
            </div>
            
            <Accordion type="multiple" className="w-full">
              {[
                {
                  question: "How does partnering with Dopaya actually help my brand grow?",
                  answer: "Partnering with Dopaya connects you with conscious consumers who are actively supporting social impact — these are engaged, values-driven customers already investing in positive change. By rewarding their impact contributions, you gain measurable visibility, authentic advocacy, and long-term loyalty. Every verified action your customers take becomes a story that builds trust around your brand. You'll reach consumers who choose brands aligned with their values (64% of global consumers), build measurable impact-driven loyalty, and grow through verified advocacy that transforms contributions into data-backed proof of impact."
                },
                {
                  question: "What does it cost to join as a brand partner?",
                  answer: "It's completely free to join! As we're just starting, all early partners get lifetime free access. We only succeed when you succeed. We make money through optional platform tips from supporters, not from brand partners. B-Corp certified brands get premium placement at no cost."
                },
                {
                  question: "What kind of rewards can I offer to supporters?",
                  answer: "You can offer any sustainable value that aligns with your mission: discounts, free products, exclusive access, early releases, or unique experiences. We help you define what works best for your brand and audience."
                },
                {
                  question: "How do I know if my brand qualifies?",
                  answer: "We welcome brands with genuine sustainability missions, ethical practices, or social impact. You don't need to be perfect, but you need authentic commitment to values beyond profit. We verify impact claims during onboarding."
                },
                {
                  question: "What's the minimum commitment or contract length?",
                  answer: "No minimum commitment required. You can pause or adjust your partnership anytime. We believe in flexible partnerships that work for your business needs. Most partners stay because they see real value."
                },
                {
                  question: "How do you ensure supporters are genuine and engaged?",
                  answer: "Our supporters earn Impact Points by supporting social enterprises, so they're already values-aligned. They're not just looking for discounts - they want to support brands that share their values. We verify engagement through their impact history."
                },
                {
                  question: "Can I track the ROI of my partnership?",
                  answer: "As we're just starting, we're building comprehensive analytics for the future. Right now, we provide basic metrics and direct feedback from supporters. Our roadmap includes detailed analytics showing: supporter engagement, reward redemptions, new customer acquisition, and impact tracking. We'll keep you updated as these features roll out."
                },
                {
                  question: "What if I want to offer different rewards or change my partnership?",
                  answer: "You have full control over your rewards and can update them anytime by contacting us directly. As we build the platform, we're planning a brand dashboard for easy self-management. You can also adjust your partnership level, add seasonal campaigns, or create special offers for high-impact supporters."
                },
                {
                  question: "How is this different from traditional loyalty programs?",
                  answer: "Traditional programs reward shopping and spending. We reward social impact - supporters earn rewards by funding social enterprises, not by buying more products. This creates a community of conscious consumers who value impact over consumption, connecting sustainable brands with supporters who share their values."
                },
                {
                  question: "What if my brand isn't B-Corp certified?",
                  answer: "B-Corp certification gets you premium placement, but it's not required. We work with any brand that has genuine sustainability practices, social impact, or ethical values. We focus on authentic commitment over certifications."
                }
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                  <AccordionTrigger className="text-left font-medium py-6 text-lg hover:text-orange-600">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6 text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                Still have questions? We're here to help!
              </p>
              <a href="/contact" className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium">
                Contact us
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-white" style={{ backgroundColor: BRAND_COLORS.primaryOrange }}>
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Join us shaping the future of impact-driven brands.</h2>
              <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto">
                Dopaya connects purpose-led brands with conscious consumers and verified social enterprises — turning every purchase into measurable impact and authentic growth.
              </p>

              {/* Primary CTA */}
              <div className="mb-8">
                <a href="https://tally.so/r/3lvVg5" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-white text-[#F05304] hover:bg-gray-100 px-8 py-6 text-lg rounded-md">
                    Become a Brand Partner
                  </Button>
                </a>
                  </div>

              {/* Benefits (keep as-is tone) */}
              <div className="grid md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
                <div className="bg-white/10 border border-white/20 rounded-lg p-5">
                  <p className="text-sm md:text-base leading-relaxed">
                    <span className="font-semibold">🟠 Free partnership forever</span> — No platform fees. We only grow when you do.
                  </p>
                  </div>
                <div className="bg-white/10 border border-white/20 rounded-lg p-5">
                  <p className="text-sm md:text-base leading-relaxed">
                    <span className="font-semibold">🟠 Values-aligned customers</span> — Reach conscious consumers who share your purpose.
                  </p>
            </div>
                <div className="bg-white/10 border border-white/20 rounded-lg p-5">
                  <p className="text-sm md:text-base leading-relaxed">
                    <span className="font-semibold">🟠 Shared impact mission</span> — Join a coalition of brands driving real social and environmental change.
                  </p>
                </div>
                </div>

              {/* Microline */}
              <p className="text-sm mt-6 opacity-90">
                Already trusted by early impact pioneers across fashion, wellness, and lifestyle sectors.
                </p>
              </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
