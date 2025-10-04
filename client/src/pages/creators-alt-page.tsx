import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Award, 
  BadgeCheck, 
  BarChart3, 
  Check, 
  ChevronRight, 
  CircleCheck, 
  Flame, 
  Gift, 
  Globe, 
  Heart, 
  Instagram, 
  LineChart, 
  Medal, 
  Rocket, 
  Shield, 
  Sparkles, 
  Star, 
  TrendingUp, 
  Trophy, 
  Users 
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function CreatorsAltPage() {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const handlePlayVideo = (index: number) => {
    setPlayingVideo(index === playingVideo ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary to-amber-500 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-display tracking-tight">
              Make money by <span className="inline-block relative">
                making change
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 358 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9C118.957 4.47226 242.456 -1.86658 355 9" stroke="white" strokeWidth="6" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/95 font-light leading-relaxed">
              Launch your own impact campaign. Raise funds for causes you care about. Get brand deals, exclusive rewards, and grow your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 font-medium">
                  Create Your Campaign
                </Button>
              </a>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white/10">
                  See How It Works
                </Button>
              </button>
            </div>
          </div>
          
          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 flex-wrap mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 flex items-center">
              <div className="flex -space-x-2 mr-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 border-2 border-white flex items-center justify-center text-xs font-bold">P</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-300 border-2 border-white flex items-center justify-center text-xs font-bold">R</div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-300 border-2 border-white flex items-center justify-center text-xs font-bold">T</div>
              </div>
              <span className="text-sm font-medium">850+ creators</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 flex items-center">
              <Trophy className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">₹28M+ raised</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">120+ causes supported</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent opacity-20"></div>
        </div>
      </section>

      {/* Featured Creators */}
      <section className="py-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Creators are already making an impact</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how creators like you are using Dopaya to drive real change
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: '@tanvi_speaks',
                followers: '92K',
                raised: '₹58,300',
                cause: 'Girls Education',
                testimonial: 'My audience loves that they can directly see the impact of their support.'
              },
              {
                name: '@rohit_creates',
                followers: '45K',
                raised: '₹87,200',
                cause: 'Clean Water',
                testimonial: 'I\'ve gained 5K new followers since starting my clean water campaign.'
              },
              {
                name: '@priya.impact',
                followers: '128K',
                raised: '₹128,500',
                cause: 'Education',
                testimonial: 'The exclusive brand deals through Dopaya have been incredible!'
              }
            ].map((creator, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                  <div className="absolute bottom-3 left-3 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 mr-2"></div>
                    <div>
                      <p className="text-white font-medium">{creator.name}</p>
                      <p className="text-white/80 text-xs">{creator.followers} followers</p>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-primary/90 rounded-full px-3 py-1 text-white text-xs font-medium">
                    {creator.cause}
                  </div>
                  <div 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={() => handlePlayVideo(idx)}
                  >
                    {playingVideo === idx ? (
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-3 h-8 bg-white"></div>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1"></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-500">Total Raised</div>
                    <div className="text-lg font-bold text-primary">{creator.raised}</div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">
                    "{creator.testimonial}"
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        <Trophy className="w-3 h-3 mr-1" />
                        Top 10
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - with tabs */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Dopaya Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to create impact and grow your audience
            </p>
          </div>
          
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-md shadow-sm">
              {['Create', 'Share', 'Grow'].map((tab, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === idx
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ${idx === 0 ? 'rounded-l-md' : ''} ${
                    idx === 2 ? 'rounded-r-md' : ''
                  } border-y border-r ${idx === 0 ? 'border-l' : ''} border-gray-200`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                {activeTab === 0 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                        <div className="font-bold text-xl">1</div>
                      </div>
                      <h3 className="text-2xl font-bold">Pick a cause you care about</h3>
                    </div>
                    <p className="text-black mb-6 text-lg">
                      Choose from our curated list of verified social projects that align with your values and audience's interests.
                    </p>
                    <ul className="space-y-3 mb-8">
                      {['Education', 'Climate', 'Healthcare', 'Women Empowerment', 'Water Conservation'].map((cause, idx) => (
                        <li key={idx} className="flex items-center">
                          <CircleCheck className="w-5 h-5 text-primary mr-3" />
                          <span className="text-black">{cause}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-black italic">
                      Or suggest a cause you want to support, and we'll find the right partners.
                    </p>
                  </div>
                )}
                
                {activeTab === 1 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                        <div className="font-bold text-xl">2</div>
                      </div>
                      <h3 className="text-2xl font-bold">Share with your audience</h3>
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">
                      You'll get a personalized campaign page and sharing toolkit with powerful features:
                    </p>
                    <ul className="space-y-4 mb-8">
                      <li className="flex">
                        <div className="mt-1 mr-3">
                          <Instagram className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium block">Instagram-ready stories & posts</span>
                          <span className="text-sm text-gray-500">Customized templates for your campaign</span>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="mt-1 mr-3">
                          <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium block">Live impact tracker</span>
                          <span className="text-sm text-gray-500">Show your audience the impact in real-time</span>
                        </div>
                      </li>
                      <li className="flex">
                        <div className="mt-1 mr-3">
                          <Globe className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium block">Custom landing page</span>
                          <span className="text-sm text-gray-500">With your branding and campaign details</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
                
                {activeTab === 2 && (
                  <div className="animate-fade-in">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
                        <div className="font-bold text-xl">3</div>
                      </div>
                      <h3 className="text-2xl font-bold">Grow your impact & influence</h3>
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">
                      As your campaign grows, so do your benefits:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Trophy className="w-5 h-5 text-amber-500 mr-2" />
                          <span className="font-medium">Earn rewards</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Exclusive badges, verified status & rankings
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Users className="w-5 h-5 text-blue-500 mr-2" />
                          <span className="font-medium">Grow audience</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Authentic content that attracts followers
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Gift className="w-5 h-5 text-purple-500 mr-2" />
                          <span className="font-medium">Brand deals</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Access to exclusive partnership opportunities
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Sparkles className="w-5 h-5 text-primary mr-2" />
                          <span className="font-medium">Real impact</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Create measurable change for causes you care about
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-100 p-4 flex items-center justify-center">
                {activeTab === 0 && (
                  <div className="relative w-full max-w-sm">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="p-4 border-b">
                        <div className="text-lg font-bold">Create Your Campaign</div>
                      </div>
                      <div className="p-5 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select a cause</label>
                          <div className="border border-gray-300 rounded-md p-2 bg-white">
                            <div className="flex items-center">
                              <div className="shrink-0">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-green-800 text-xs">🌱</span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">Education for Girls</p>
                                <p className="text-xs text-gray-500">Support education in rural India</p>
                              </div>
                              <div className="ml-auto">
                                <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
                          <div className="relative rounded-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                              type="text"
                              className="block w-full pl-8 pr-12 py-2 sm:text-sm border border-gray-300 rounded-md"
                              value="50,000"
                              readOnly
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                          <input
                            type="text"
                            className="block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                            value="Educate Girls with Tanvi"
                            readOnly
                          />
                        </div>
                        
                        <Button className="w-full bg-primary text-white hover:bg-primary/90">
                          Create Campaign
                        </Button>
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-6 -right-6 transform rotate-6 bg-white rounded-xl shadow-lg w-32 p-3">
                      <div className="text-xs font-medium text-gray-500 mb-1">Projects that match:</div>
                      <div className="text-2xl font-bold text-primary">24</div>
                    </div>
                  </div>
                )}
                
                {activeTab === 1 && (
                  <div className="relative w-full max-w-sm">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                      <div className="relative h-48 bg-gray-200">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute top-3 left-3">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                            @tanvi_speaks
                          </div>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <h3 className="text-white font-bold text-lg">Educate Girls with Tanvi</h3>
                          <p className="text-white/80 text-sm">Support education in rural India</p>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm text-gray-500">Raised so far</div>
                            <div className="text-2xl font-bold">₹26,450</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Goal</div>
                            <div className="text-2xl font-bold">₹50,000</div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>53% Complete</span>
                            <span>47% to go</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: '53%' }}></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex -space-x-2">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                            ))}
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium">+28</div>
                          </div>
                          <div className="text-sm text-gray-500">33 supporters</div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1 text-sm py-1 h-auto">
                            Preview
                          </Button>
                          <Button className="flex-1 text-sm py-1 h-auto bg-primary text-white hover:bg-primary/90">
                            Share Now
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute -top-5 -right-5 transform -rotate-12 bg-white rounded-lg shadow-md p-2">
                      <div className="bg-primary/10 rounded-md p-1">
                        <Instagram className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    
                    <div className="absolute -bottom-8 -left-8 transform rotate-6 bg-white rounded-lg shadow-md p-2">
                      <div className="bg-primary/10 rounded-md p-1">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 2 && (
                  <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                      <div className="bg-primary text-white p-4">
                        <h3 className="font-bold text-lg">Creator Impact Dashboard</h3>
                      </div>
                      
                      <div className="p-5">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500 mb-1">Total Raised</div>
                            <div className="text-2xl font-bold">₹128,500</div>
                            <div className="text-xs text-green-600 mt-1 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +15% this month
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500 mb-1">New Followers</div>
                            <div className="text-2xl font-bold">+1,245</div>
                            <div className="text-xs text-green-600 mt-1 flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              +32% this month
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="text-sm font-medium mb-2">Your Achievements</div>
                          <div className="flex flex-wrap gap-2">
                            <div className="bg-amber-50 rounded-full px-3 py-1 text-xs font-medium text-amber-700 flex items-center">
                              <Trophy className="w-3 h-3 mr-1" />
                              Top Creator
                            </div>
                            <div className="bg-blue-50 rounded-full px-3 py-1 text-xs font-medium text-blue-700 flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              Education Champion
                            </div>
                            <div className="bg-green-50 rounded-full px-3 py-1 text-xs font-medium text-green-700 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              1K+ Supporters
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <div className="text-sm font-medium mb-2">Brand Opportunities</div>
                          <div className="border border-gray-200 rounded-lg p-3 mb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mr-3">
                                  B
                                </div>
                                <div>
                                  <p className="font-medium text-sm">Sustainable Fashion Brand</p>
                                  <p className="text-xs text-gray-500">₹45,000 Campaign</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="h-7 text-xs">View</Button>
                            </div>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 mr-3">
                                  E
                                </div>
                                <div>
                                  <p className="font-medium text-sm">Eco-friendly Products</p>
                                  <p className="text-xs text-gray-500">₹30,000 Campaign</p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" className="h-7 text-xs">View</Button>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <Button className="w-full bg-primary text-white hover:bg-primary/90">
                            View Full Dashboard
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Tracking & Leaderboard */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">Track Your Impact in Real-Time</h2>
            <p className="text-xl text-black max-w-3xl mx-auto">
              See exactly how your influence is driving real change
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Impact Dashboard */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-primary px-6 py-8 text-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Your Impact Dashboard</h3>
                    <p className="text-white/90 text-sm">@tanvi_speaks</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    <span className="font-medium">Changemaker</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-white">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <BarChart3 className="w-5 h-5 text-primary mr-2" />
                      <span className="text-sm font-medium text-black">Total Impact Score</span>
                    </div>
                    <p className="text-2xl font-bold text-black">2,450</p>
                    <div className="flex items-center mt-1 text-xs text-primary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+325 this month</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Trophy className="w-5 h-5 text-primary mr-2" />
                      <span className="text-sm font-medium text-black">Total Raised</span>
                    </div>
                    <p className="text-2xl font-bold text-black">₹58,300</p>
                    <div className="flex items-center mt-1 text-xs text-primary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+₹12,450 this month</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-black">Impact by SDG</h4>
                    <span className="text-xs text-gray-600">Last 3 months</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-black">Education (SDG 4)</span>
                        <span className="font-medium text-black">65%</span>
                      </div>
                      <div className="bg-gray-200 h-2 rounded-full">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-black">Gender Equality (SDG 5)</span>
                        <span className="font-medium text-black">25%</span>
                      </div>
                      <div className="bg-gray-200 h-2 rounded-full">
                        <div className="bg-primary h-2 rounded-full opacity-75" style={{ width: '25%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-black">Clean Water (SDG 6)</span>
                        <span className="font-medium text-black">10%</span>
                      </div>
                      <div className="bg-gray-200 h-2 rounded-full">
                        <div className="bg-primary h-2 rounded-full opacity-50" style={{ width: '10%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-black">Campaign Impact</h4>
                    <span className="text-xs text-primary font-medium cursor-pointer">See all</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary mr-3">
                        <span className="text-xs font-medium">Ed</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">Girls' Education Campaign</p>
                        <p className="text-xs text-gray-600">120 girls supported</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">₹28,500</p>
                        <p className="text-xs text-gray-600">42 supporters</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary mr-3">
                        <span className="text-xs font-medium">WE</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">Women Entrepreneurship</p>
                        <p className="text-xs text-gray-600">18 businesses funded</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-black">₹18,800</p>
                        <p className="text-xs text-gray-600">27 supporters</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Creator Leaderboard */}
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-primary px-6 py-8 text-white">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Creator Impact Leaderboard</h3>
                    <p className="text-white/90 text-sm">Top creators this month</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    <span className="font-medium">You're #8</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white divide-y">
                {[
                  { rank: 1, handle: '@priya.impact', avatar: 'P', cause: 'Education', raised: '₹128,500', supporters: 214, change: '+3 ↑' },
                  { rank: 2, handle: '@rohit_creates', avatar: 'R', cause: 'Clean Water', raised: '₹87,200', supporters: 178, change: '+1 ↑' },
                  { rank: 3, handle: '@green_amit', avatar: 'A', cause: 'Climate Action', raised: '₹72,400', supporters: 156, change: '-1 ↓' },
                  { rank: 4, handle: '@meera.social', avatar: 'M', cause: 'Healthcare', raised: '₹65,800', supporters: 143, change: '+2 ↑' },
                  { rank: 5, handle: '@deepak.tech', avatar: 'D', cause: 'Digital Literacy', raised: '₹62,100', supporters: 134, change: '0 =' }
                ].map((creator, idx) => (
                  <div key={idx} className="flex items-center p-4">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-bold mr-3">
                      {creator.rank}
                    </div>
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-100 text-primary flex items-center justify-center mr-3">
                        {creator.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-black">{creator.handle}</p>
                        <p className="text-xs text-gray-600">{creator.cause}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-black">{creator.raised}</p>
                      <div className="flex items-center justify-end">
                        <Users className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">{creator.supporters}</span>
                      </div>
                    </div>
                    <div className="ml-4 w-12 text-right">
                      <span className={`text-xs ${creator.change.includes('↑') ? 'text-primary' : creator.change.includes('↓') ? 'text-gray-600' : 'text-gray-600'}`}>
                        {creator.change}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="p-4 bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold mr-3">
                      8
                    </div>
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center mr-3 border-2 border-primary">
                        T
                      </div>
                      <div>
                        <p className="font-medium text-sm text-black">@tanvi_speaks <span className="text-primary text-xs">(You)</span></p>
                        <p className="text-xs text-gray-600">Girls Education</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-black">₹58,300</p>
                      <div className="flex items-center justify-end">
                        <Users className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-600">78</span>
                      </div>
                    </div>
                    <div className="ml-4 w-12 text-right">
                      <span className="text-xs text-primary">+4 ↑</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 text-center">
                  <button className="text-primary text-sm font-medium hover:underline">View Full Leaderboard</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Creators Are Saying</h2>
              <p className="text-xl text-gray-600">
                Join creators who are making a difference and growing their audience
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow relative">
              <div className="text-primary text-5xl absolute -top-4 -left-2">"</div>
              <blockquote className="pt-4 relative z-10">
                <p className="text-gray-700 mb-6">
                  Dopaya made it easy to turn my passion for women's education into a real campaign. I gained 5K followers and raised over ₹50K!
                </p>
                <footer>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                    <div>
                      <cite className="font-medium block">Tanvi Sharma</cite>
                      <span className="text-sm text-gray-500">92K followers • @tanvi_speaks</span>
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow relative">
              <div className="text-primary text-5xl absolute -top-4 -left-2">"</div>
              <blockquote className="pt-4 relative z-10">
                <p className="text-gray-700 mb-6">
                  The brand partnerships I've gotten through Dopaya are more authentic and pay better than the random DMs I used to get.
                </p>
                <footer>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                    <div>
                      <cite className="font-medium block">Rohit Verma</cite>
                      <span className="text-sm text-gray-500">45K followers • @rohit_creates</span>
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow relative">
              <div className="text-primary text-5xl absolute -top-4 -left-2">"</div>
              <blockquote className="pt-4 relative z-10">
                <p className="text-gray-700 mb-6">
                  My audience loves that they can see exactly where their money goes. It's brought my community together around a shared purpose.
                </p>
                <footer>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                    <div>
                      <cite className="font-medium block">Priya Malhotra</cite>
                      <span className="text-sm text-gray-500">128K followers • @priya.impact</span>
                    </div>
                  </div>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about creating impact campaigns
            </p>
          </div>
          
          <div className="space-y-4">
            {[
              {
                question: "How do I get started with Dopaya?",
                answer: "Getting started is easy! Just sign up using the 'Create Your Campaign' button, select a cause you're passionate about, and we'll guide you through setting up your personal impact campaign."
              },
              {
                question: "Is there a minimum follower count required?",
                answer: "No, we believe impact can come from creators of all sizes. While we have special programs for creators with 10K+ followers, everyone is welcome to start a campaign."
              },
              {
                question: "How do brand opportunities work?",
                answer: "Once you've successfully raised a certain amount (typically ₹25,000+), you'll gain access to our brand partnerships platform. We match you with brands that align with your values and audience interests."
              },
              {
                question: "Can I track the impact of my campaign?",
                answer: "Absolutely! You'll get access to a detailed dashboard showing funds raised, supporter growth, and direct impact metrics from the projects you support."
              },
              {
                question: "How does Dopaya make money?",
                answer: "Dopaya takes a small platform fee (7%) from donations to cover operating costs. We're transparent about this with donors, and 93% of all donations go directly to the causes."
              }
            ].map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg">
                <div className="px-6 py-4 cursor-pointer bg-gray-50 rounded-t-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  </div>
                </div>
                <div className="px-6 py-4 text-gray-600">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to turn your influence into impact?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 850+ creators who are using their platform to make real change and grow their audience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="https://tally.so/r/m6MqAe" target="_blank">
              <Button size="lg" className="text-lg px-8 py-6 bg-primary text-white hover:bg-primary/90 font-medium">
                Create Your Campaign <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary/5">
                Learn More
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            No commitment required. Start your campaign today and make a difference.
          </p>
        </div>
      </section>

      {/* Floating CTA */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="https://tally.so/r/m6MqAe" target="_blank">
          <Button size="lg" className="shadow-lg bg-gradient-to-r from-primary to-amber-500 text-white hover:from-primary/90 hover:to-amber-400">
            Start Now
          </Button>
        </Link>
      </div>
    </div>
  );
}