import { useState, useEffect, useRef } from "react";
import { SEOHead } from "@/components/seo/seo-head";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle, Users, BarChart, Star, TrendingUp, Award, Target, Zap, FileText } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Project } from "@shared/schema";
import { supabase } from "@/lib/supabase";

export default function SocialEnterprisesPage() {
  const [isVisible, setIsVisible] = useState(false);
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch active projects from Supabase
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["projects-social-enterprises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('active', true)
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Auto-scroll effect for projects
  useEffect(() => {
    const projectsContainer = projectsRef.current;
    if (!projectsContainer || !projects.length) return;

    const scroll = () => {
      if (projectsContainer.scrollLeft >= projectsContainer.scrollWidth - projectsContainer.clientWidth) {
        projectsContainer.scrollLeft = 0;
      } else {
        projectsContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [projects]);

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

  return (
    <>
      <SEOHead
        title="For Social Enterprises - Join Dopaya"
        description="Unlock funding, visibility, and support to scale your social enterprise. Get donations, meet investors, and access smart grant tools — all in one place."
        keywords="social enterprises, impact funding, grant applications, investor matching, social entrepreneurship, impact investing, startup funding"
        canonicalUrl="https://dopaya.org/social-enterprises"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Social Enterprises Program",
          "description": "Platform for social enterprises to access funding, investors, and grant support",
          "url": "https://dopaya.org/social-enterprises",
          "mainEntity": {
            "@type": "Service",
            "name": "Social Enterprise Support Program",
            "provider": {
              "@type": "Organization",
              "name": "Dopaya"
            },
            "serviceType": "Business Support",
            "areaServed": "Global"
          }
        }}
      />
      
      <div className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="bg-[#F9F7F0] py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Unlock funding, visibility, and support to scale your social enterprise.
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Get donations, meet investors, and access smart grant tools — all in one place.
              </p>
              <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#F05304] hover:bg-[#d43d25] text-white px-8 py-6 text-lg rounded-md">
                  Apply Now
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
                
                {/* Projects Section */}
                <div className="mb-8">
                  <div 
                    ref={projectsRef}
                    className="flex gap-3 overflow-x-hidden"
                  >
                    {(projects as Project[]).map((project: Project, index: number) => (
                      <div key={project.id} className="group hover:scale-105 transition-transform duration-200 relative flex-shrink-0 w-1/2 lg:w-1/4">
                        <img 
                          src={project.imageUrl || 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'} 
                          alt={project.title} 
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute bottom-2 left-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            project.category === 'Education' ? 'bg-blue-100 text-blue-800' :
                            project.category === 'Environment' ? 'bg-green-100 text-green-800' :
                            project.category === 'Health' ? 'bg-red-100 text-red-800' :
                            project.category === 'Poverty' ? 'bg-purple-100 text-purple-800' :
                            project.category === 'Rural Development' ? 'bg-yellow-100 text-yellow-800' :
                            project.category === 'Agriculture' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="rounded-full bg-blue-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">Sector agnostic</p>
                    <p className="text-xs text-gray-600">All causes welcome</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="rounded-full bg-green-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">Free of cost</p>
                    <p className="text-xs text-gray-600">No platform fees</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="rounded-full bg-purple-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">Application only</p>
                    <p className="text-xs text-gray-600">Simple process</p>
                  </div>
                </div>
                
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Funding is out there — but hard to access.</h2>
            <p className="text-lg text-gray-600 mb-6">
              Early-stage social enterprises often struggle to tap into funding streams designed for NGOs or established ventures. Tax limitations, high grant complexity, and investor access barriers make it hard to grow despite proven impact.
            </p>
            <p className="text-lg text-gray-700 font-medium">
              Dopaya opens new and existing channels so you can focus on what really matters: your mission.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How We Support You</h2>
          </div>
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
              <div className="rounded-full bg-blue-100 w-14 h-14 flex items-center justify-center mb-5">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Individual Donations</h3>
              <p className="text-gray-600">
                Receive donations from individuals directly via our platform — even if you can't normally accept them.
              </p>
            </motion.div>

            <motion.div 
              variants={item}
              whileHover={cardHover}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-green-100 w-14 h-14 flex items-center justify-center mb-5">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Access to Impact Investors</h3>
              <p className="text-gray-600">
                Get matched with angel and impact investors through curated intros and speed dating formats that accelerate partnerships.
              </p>
            </motion.div>

            <motion.div 
              variants={item}
              whileHover={cardHover}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-purple-100 w-14 h-14 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">3. AI-Powered Grant Support</h3>
              <p className="text-gray-600">
                Find relevant grants and let our AI help you prepare high-quality applications, reducing admin time and increasing chances of success.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works (Step Layout) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
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
                <div className="text-center pt-6">
                  <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Apply</h3>
                  <p className="text-gray-600">
                    Submit your enterprise profile and impact information.
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
                <div className="text-center pt-6">
                  <div className="rounded-full bg-purple-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Get Selected</h3>
                  <p className="text-gray-600">
                    Our team reviews your application and selects high-potential ventures based on clear criteria.
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
                <div className="text-center pt-6">
                  <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Access Funding Streams</h3>
                  <p className="text-gray-600">
                    Start receiving donations, connect with investors, and apply for grants with our AI-powered tools.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Project Showcase */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Your Project Showcase</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Become part of other outstanding social projects on our platform and showcase your impact
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.slice(0, 4).map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.imageUrl || "/api/placeholder/400/240"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.category === 'Education' ? 'bg-blue-100 text-blue-800' :
                        project.category === 'Environment' ? 'bg-green-100 text-green-800' :
                        project.category === 'Health' ? 'bg-red-100 text-red-800' :
                        project.category === 'Poverty' ? 'bg-purple-100 text-purple-800' :
                        project.category === 'Rural Development' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                    
                    <Link href={`/projects/${project.slug}`}>
                      <Button className="w-full bg-[#F05304] hover:bg-[#d43d25] text-white">
                        Read More
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Social Startups Choose Dopaya</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-blue-100 w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3">Unlock new funding</h3>
              <p className="text-gray-600 text-sm">
                Accept donations and funding that would otherwise be out of reach.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-green-100 w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Meet aligned funders</h3>
              <p className="text-gray-600 text-sm">
                Engage with donors and investors who are impact-driven and startup-aligned.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-purple-100 w-14 h-14 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-3">Apply for grants more easily</h3>
              <p className="text-gray-600 text-sm">
                Get notified about relevant grants and help in your application - to make it less struggle and time intense for you as a founder.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="rounded-full bg-orange-100 w-14 h-14 flex items-center justify-center mb-4">
                <Target className="h-7 w-7 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-3">Focus on your mission</h3>
              <p className="text-gray-600 text-sm">
                We handle the fundraising infrastructure so you can deliver impact.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Eligibility Criteria Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Eligibility Criteria</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Business Model & Stage</h4>
              <p className="text-gray-600 text-sm">
                Early-stage, legally registered, with proven revenue or potential.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Organization Type</h4>
              <p className="text-gray-600 text-sm">
                Pvt Ltd, Section 8, or similar revenue-generating social ventures. NGOs not eligible.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Impact Orientation</h4>
              <p className="text-gray-600 text-sm">
                Clear, measurable social or environmental impact, ideally quantifiable.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Founder Profile</h4>
              <p className="text-gray-600 text-sm">
                Mission-driven, entrepreneurial founders committed to long-term change.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Use of Funds</h4>
              <p className="text-gray-600 text-sm">
                Donations must be used for tangible impact with long-term sustainability.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Sector</h4>
              <p className="text-gray-600 text-sm">
                All sectors welcome, as long as measurable impact is demonstrated.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h4 className="font-semibold text-gray-900 mb-3">Region</h4>
              <p className="text-gray-600 text-sm">
                No geographic restrictions if measurable local outcomes are ensured.
              </p>
            </motion.div>

            {/* Empty space for layout balance */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>



      {/* Apply Now Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-2">It's free. It's simple. It's for changemakers.</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Join the community of social enterprises making a meaningful impact across India.
            </p>
            <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#F05304] hover:bg-[#d43d25] text-white px-8 py-6 text-lg rounded-md">
                Apply Now
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 py-3 px-4 z-50 md:hidden">
        <div className="flex justify-between items-center">
          <p className="font-medium text-gray-800">Ready to grow your impact?</p>
          <a href="https://tally.so/r/3EM0vA" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-[#F05304] hover:bg-[#d43d25] text-white">
              Apply Now
            </Button>
          </a>
        </div>
      </div>
      </div>
    </>
  );
}