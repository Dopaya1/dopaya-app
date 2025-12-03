import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { TYPOGRAPHY } from "@/constants/typography";
import { BRAND_COLORS } from "@/constants/colors";
import { useTranslation } from "@/lib/i18n/use-translation";

interface DashboardFeature {
  step: string
  title: string
  content: string
  image: string
}

// Dashboard Mockup Renderer
const DashboardMockup = ({ type }: { type: string }) => {
  const renderDashboard = () => {
    switch (type) {
      case 'dashboard-individual':
        return (
          <div className="w-full h-full bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>Your Dashboard</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Live</span>
              </div>
            </div>

            {/* Main Chart Area with Filled Graph */}
            <div className="h-40 bg-gray-50 rounded-lg mb-6 relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
                {/* Filled Area */}
                <path
                  d="M 10 120 L 50 100 L 90 80 L 130 60 L 170 40 L 210 20 L 250 10 L 250 120 L 10 120 Z"
                  fill={BRAND_COLORS.primaryOrange}
                  fillOpacity="0.3"
                />
                {/* Trend Line */}
                <polyline
                  points="10,120 50,100 90,80 130,60 170,40 210,20 250,10"
                  fill="none"
                  stroke={BRAND_COLORS.primaryOrange}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Data Points */}
                <circle cx="10" cy="120" r="5" fill={BRAND_COLORS.primaryOrange} />
                <circle cx="50" cy="100" r="5" fill={BRAND_COLORS.primaryOrange} />
                <circle cx="90" cy="80" r="5" fill={BRAND_COLORS.primaryOrange} />
                <circle cx="130" cy="60" r="5" fill={BRAND_COLORS.primaryOrange} />
                <circle cx="170" cy="40" r="5" fill={BRAND_COLORS.primaryOrange} />
                <circle cx="210" cy="20" r="5" fill={BRAND_COLORS.primaryOrange} />
                <circle cx="250" cy="10" r="5" fill={BRAND_COLORS.primaryOrange} />
                {/* Trend Arrow */}
                <polygon
                  points="245,12 255,8 245,4"
                  fill={BRAND_COLORS.primaryOrange}
                />
              </svg>
              <div className="absolute top-3 left-4 text-sm font-medium" style={{ color: BRAND_COLORS.textPrimary }}>
                Impact Growth ↗️
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold mb-1" style={{ color: BRAND_COLORS.primaryOrange }}>$1,250</div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>Donated</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold mb-1" style={{ color: BRAND_COLORS.primaryOrange }}>8</div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>Projects</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold mb-1" style={{ color: BRAND_COLORS.primaryOrange }}>650</div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>Points</div>
              </div>
            </div>
          </div>
        );

      case 'dashboard-ranking':
        return (
          <div className="w-full h-full bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>Impact Ranking</h3>
              <div className="px-3 py-1 rounded-full text-xs font-medium" 
                   style={{ backgroundColor: '#FFF4ED', color: BRAND_COLORS.primaryOrange }}>
                Impact Hero
              </div>
            </div>

            {/* Current Rank */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: BRAND_COLORS.bgCool }}>
              <div className="text-center mb-3">
                <div className="text-2xl font-bold mb-1" style={{ color: BRAND_COLORS.primaryOrange }}>#42</div>
                <div className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Your Current Rank</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <div className="text-center text-xs" style={{ color: BRAND_COLORS.textSecondary }}>650/1000 pts to next rank</div>
            </div>

            {/* Next Stages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-bold">43</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Impact Champion</div>
                    <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>1000 pts • Premium rewards</div>
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Next</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">44</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Impact Legend</div>
                    <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>2000 pts • Exclusive access</div>
                  </div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Future</div>
              </div>
            </div>
          </div>
        );

      case 'dashboard-impact-tracking':
        return (
          <div className="w-full h-full bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>Impact Tracking</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Live</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1" style={{ color: BRAND_COLORS.primaryOrange }}>$2,450</div>
                <div className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Total Donated</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold mb-1" style={{ color: BRAND_COLORS.primaryOrange }}>1,250</div>
                <div className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Impact Points</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📚</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Education Project</div>
                    <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>5 children supported</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: BRAND_COLORS.primaryOrange }}>+150 pts</div>
                  <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>$500</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">🌱</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Environmental</div>
                    <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>20 trees planted</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium" style={{ color: BRAND_COLORS.primaryOrange }}>+200 pts</div>
                  <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>$300</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'dashboard-visualizations':
        return (
          <div className="w-full h-full bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>Impact Analytics</h3>
              <div className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Last 6 months</div>
            </div>

            {/* Chart Area */}
            <div className="h-32 bg-gray-50 rounded-lg mb-4 relative overflow-hidden">
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                {[40, 65, 45, 80, 70, 90].map((height, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div 
                      className="w-6 rounded-t-sm transition-all duration-1000"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: BRAND_COLORS.primaryOrange,
                        opacity: 0.8
                      }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="absolute top-2 left-4 text-sm font-medium" style={{ color: BRAND_COLORS.textPrimary }}>
                Impact Growth
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>12</div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>Projects</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>85%</div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>Success</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold" style={{ color: BRAND_COLORS.primaryOrange }}>#42</div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>Rank</div>
              </div>
            </div>
          </div>
        );

      case 'dashboard-rewards':
        return (
          <div className="w-full h-full bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>Rewards & Rank</h3>
              <div className="px-3 py-1 rounded-full text-xs font-medium" 
                   style={{ backgroundColor: '#FFF4ED', color: BRAND_COLORS.primaryOrange }}>
                Impact Hero
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: BRAND_COLORS.textSecondary }}>Progress to next rank</span>
                <span className="text-sm font-medium" style={{ color: BRAND_COLORS.textPrimary }}>750/1000 pts</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🎁</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Starbucks Gift Card</div>
                  <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>500 pts • 20% off</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Available</div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">✈️</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Travel Voucher</div>
                  <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>1000 pts • $50 value</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">Locked</div>
              </div>
            </div>
          </div>
        );

      case 'dashboard-founding':
        return (
          <div className="w-full h-full bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold" style={{ color: BRAND_COLORS.textPrimary }}>Founding Member</h3>
              <div className="px-3 py-1 rounded-full text-xs font-medium text-white" 
                   style={{ backgroundColor: BRAND_COLORS.primaryOrange }}>
                VIP
              </div>
            </div>

            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FFF4ED' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👑</span>
                <span className="font-semibold text-sm" style={{ color: BRAND_COLORS.primaryOrange }}>Exclusive Benefits</span>
              </div>
              <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>
                Lifetime access to all premium features
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Priority support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Skip impact ranks</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Exclusive rewards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <span className="text-sm" style={{ color: BRAND_COLORS.textPrimary }}>Early feature access</span>
              </div>
            </div>

            <div className="mt-6 p-3 rounded-lg border-2 border-dashed" style={{ borderColor: BRAND_COLORS.borderSubtle }}>
              <div className="text-center">
                <div className="text-sm font-medium mb-1" style={{ color: BRAND_COLORS.textPrimary }}>Join 2,847 founding members</div>
                <div className="text-xs" style={{ color: BRAND_COLORS.textSecondary }}>Limited time offer</div>
              </div>
            </div>
          </div>
        );

      default:
        return <div className="w-full h-full bg-gray-100 rounded-lg"></div>;
    }
  };

  return renderDashboard();
};

export function ImpactDashboardSection() {
  const { t } = useTranslation();
  const [activeVariant, setActiveVariant] = useState<'feature-steps' | 'animated-cards' | 'split-view' | 'minimal-list'>('animated-cards');
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayInterval = 4000;

  const features: DashboardFeature[] = [
    {
      step: "",
      title: t("homeSections.impactDashboard.individualDashboard.title"),
      content: t("homeSections.impactDashboard.individualDashboard.content"),
      image: "dashboard-individual"
    },
    {
      step: "",
      title: t("homeSections.impactDashboard.impactRanking.title"),
      content: t("homeSections.impactDashboard.impactRanking.content"),
      image: "dashboard-ranking"
    },
    {
      step: t("homeSections.impactDashboard.impactTracking.step"),
      title: t("homeSections.impactDashboard.impactTracking.title"),
      content: t("homeSections.impactDashboard.impactTracking.content"),
      image: "dashboard-impact-tracking"
    },
    {
      step: t("homeSections.impactDashboard.foundingMember.step"),
      title: t("homeSections.impactDashboard.foundingMember.title"),
      content: t("homeSections.impactDashboard.foundingMember.content"),
      image: "dashboard-founding"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentFeature > 0) {
        setCurrentFeature(currentFeature - 1);
        setProgress(0);
      } else if (e.key === 'ArrowRight' && currentFeature < features.length - 1) {
        setCurrentFeature(currentFeature + 1);
        setProgress(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFeature, features.length]);

  // Touch swipe handlers for mobile
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
      setProgress(0);
    }
    if (isRightSwipe && currentFeature > 0) {
      setCurrentFeature(currentFeature - 1);
      setProgress(0);
    }
  };

  return (
    <>

      {/* VARIANT 1: Feature Steps (Current) */}
      {activeVariant === 'feature-steps' && (
    <section id="impact-dashboard" className="py-24 relative" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
            color: BRAND_COLORS.textPrimary, 
            fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
          }}>
            {t("homeSections.impactDashboard.title")}
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
            {t("homeSections.impactDashboard.subtitle")}
          </p>
        </div>

        {/* Feature Steps - Elegant Auto-Playing Design */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          
          {/* Left: Feature List with Progress Indicators */}
          <div className="space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-6 cursor-pointer"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.4 }}
                transition={{ duration: 0.5 }}
                onClick={() => {
                  setCurrentFeature(index);
                  setProgress(0);
                }}
              >
                {/* Step Indicator with Check/Number */}
                <motion.div
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                  style={{
                    backgroundColor: index === currentFeature ? BRAND_COLORS.primaryOrange : BRAND_COLORS.bgWhite,
                    borderColor: index === currentFeature ? BRAND_COLORS.primaryOrange : BRAND_COLORS.borderSubtle,
                    color: index === currentFeature ? 'white' : BRAND_COLORS.textMuted,
                    transform: index === currentFeature ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {index < currentFeature ? (
                    <span className="text-xl font-bold">✓</span>
                  ) : (
                    <span className="text-lg font-semibold">{index + 1}</span>
                  )}
                </motion.div>

                {/* Feature Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2" style={{ 
                    color: index === currentFeature ? BRAND_COLORS.textPrimary : BRAND_COLORS.textSecondary 
                  }}>
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed" style={{ 
                    color: BRAND_COLORS.textSecondary 
                  }}>
                    {feature.content}
                  </p>

                  {/* Progress Bar for Active Feature */}
                  {index === currentFeature && (
                    <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: BRAND_COLORS.primaryOrange,
                          width: `${progress}%`
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Animated Dashboard Screenshot */}
          <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl shadow-2xl" style={{ 
            border: `1px solid ${BRAND_COLORS.borderSubtle}` 
          }}>
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-2xl overflow-hidden"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <DashboardMockup type={feature.image} />
                      
                      {/* Feature Label Overlay */}
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="inline-block px-4 py-2 rounded-full text-white text-sm font-medium mb-3" 
                             style={{ backgroundColor: BRAND_COLORS.primaryOrange }}>
                          {feature.step}
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">
                          {feature.title}
                        </h4>
                      </div>
                    </motion.div>
                  ),
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* CTA - Founding Member */}
        <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4" 
               style={{ backgroundColor: '#FFF4ED', color: BRAND_COLORS.primaryOrange }}>
            {t("homeSections.impactDashboard.foundingMemberBenefits")}
          </div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: BRAND_COLORS.textPrimary }}>
            {t("homeSections.impactDashboard.getLifetimeAccess")}
          </h3>
          <p className="text-base mb-6" style={{ color: BRAND_COLORS.textSecondary }}>
            {t("homeSections.impactDashboard.joinNowDescription")}
          </p>
          <Button 
            size="lg" 
            className="text-white font-semibold px-8"
            style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
            asChild
          >
            <Link href="https://tally.so/r/m6MqAe" target="_blank">
              {t("homeSections.impactDashboard.joinWaitlist")}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
      )}

      {/* VARIANT 2: Animated Cards (Testimonial Style) */}
      {activeVariant === 'animated-cards' && (
        <section id="impact-dashboard" className="py-24" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
                color: BRAND_COLORS.textPrimary, 
                fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
              }}>
                {t("homeSections.impactDashboard.title")}
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
                {t("homeSections.impactDashboard.subtitle")}
              </p>
            </div>

            <div 
              className="grid md:grid-cols-2 gap-12 items-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Left: Stacked Images with Animation */}
              <div className="relative h-96">
                <AnimatePresence>
                  {features.map((feature, index) => (
                    <motion.div
                      key={`${feature.title}-${index}`}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                        z: -100,
                        rotate: Math.floor(Math.random() * 21) - 10,
                      }}
                      animate={{
                        opacity: index === currentFeature ? 1 : 0,
                        scale: index === currentFeature ? 1 : 0.95,
                        z: index === currentFeature ? 0 : -100,
                        rotate: index === currentFeature ? 0 : Math.floor(Math.random() * 21) - 10,
                        zIndex: index === currentFeature ? 1 : features.length + 2 - index,
                        y: index === currentFeature ? [0, -40, 0] : 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        z: 100,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 origin-bottom cursor-pointer"
                      onClick={() => {
                        setCurrentFeature(index);
                        setProgress(0);
                      }}
                    >
                      <div className="h-full w-full rounded-3xl shadow-2xl overflow-hidden">
                        <DashboardMockup type={feature.image} />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Right: Content with Blur Animation */}
              <div className="flex flex-col justify-between py-4">
                <motion.div
                  key={currentFeature}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4" 
                       style={{ backgroundColor: BRAND_COLORS.primaryOrange, color: 'white' }}>
                    {features[currentFeature].step}
                  </div>
                  <h3 className="text-3xl font-bold mb-3" style={{ color: BRAND_COLORS.textPrimary }}>
                    {features[currentFeature].title}
                  </h3>
                  <motion.p className="text-lg leading-relaxed" style={{ color: BRAND_COLORS.textSecondary }}>
                    {features[currentFeature].content.split(" ").map((word, index) => (
                      <motion.span
                        key={index}
                        initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * index }}
                        className="inline-block"
                      >
                        {word}&nbsp;
                      </motion.span>
                    ))}
                  </motion.p>
                </motion.div>

                {/* Navigation Dots */}
                <div className="flex gap-2 mt-8">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentFeature(index);
                        setProgress(0);
                      }}
                      className="w-2 h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: index === currentFeature ? BRAND_COLORS.primaryOrange : BRAND_COLORS.borderSubtle,
                        width: index === currentFeature ? '24px' : '8px'
                      }}
                    />
                  ))}
                </div>
                
              </div>
            </div>


          </div>
        </section>
      )}

      {/* VARIANT 3: Split View (Clay.com Style) */}
      {activeVariant === 'split-view' && (
        <section id="impact-dashboard" className="py-24" style={{ backgroundColor: BRAND_COLORS.bgCool }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
                color: BRAND_COLORS.textPrimary, 
                fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
              }}>
                {t("homeSections.impactDashboard.oneDashboard")}
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
                {t("homeSections.impactDashboard.trackEveryDollar")}
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-8 items-start">
              
              {/* Left: Large Dashboard Preview (60%) */}
              <div className="lg:col-span-3">
                <div className="sticky top-24">
                  <div 
                    className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-200"
                    style={{ 
                      backgroundColor: BRAND_COLORS.bgWhite,
                      border: `1px solid ${BRAND_COLORS.borderSubtle}` 
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${features[currentFeature].title}-${currentFeature}`}
                        className="w-full h-full"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                      >
                        <DashboardMockup type={features[currentFeature].image} />
                      </motion.div>
                    </AnimatePresence>
                    <div className="absolute bottom-8 left-8 right-8">
                      <motion.h4 
                        key={`title-${currentFeature}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-3xl font-bold text-white"
                      >
                        {features[currentFeature].title}
                      </motion.h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Feature List (40%) */}
              <div className="lg:col-span-2 space-y-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="p-6 rounded-xl cursor-pointer transition-all"
                    style={{
                      backgroundColor: index === currentFeature ? BRAND_COLORS.bgWhite : 'transparent',
                      border: `1px solid ${index === currentFeature ? BRAND_COLORS.borderSubtle : 'transparent'}`,
                      boxShadow: index === currentFeature ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none'
                    }}
                    onClick={() => {
                      setCurrentFeature(index);
                      setProgress(0);
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: index === currentFeature ? BRAND_COLORS.primaryOrange : BRAND_COLORS.bgCool,
                          color: index === currentFeature ? 'white' : BRAND_COLORS.textMuted
                        }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1" style={{ 
                          color: index === currentFeature ? BRAND_COLORS.textPrimary : BRAND_COLORS.textSecondary 
                        }}>
                          {feature.title}
                        </h3>
                        <p className="text-sm" style={{ color: BRAND_COLORS.textMuted }}>
                          {feature.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* CTA in sidebar */}
                <div className="p-6 rounded-xl" style={{ backgroundColor: '#FFF4ED' }}>
                  <div className="text-sm font-semibold mb-2" style={{ color: BRAND_COLORS.primaryOrange }}>
                    {t("homeSections.impactDashboard.foundingMemberBenefits")}
                  </div>
                  <p className="text-sm mb-4" style={{ color: BRAND_COLORS.textSecondary }}>
                    {t("homeSections.impactDashboard.joinAsFoundingMember")}
                  </p>
                  <Button 
                    size="sm"
                    className="text-white font-semibold w-full"
                    style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                    asChild
                  >
                    <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer">
                      {t("homeSections.impactDashboard.joinWaitlist")}
                    </a>
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* VARIANT 4: Minimal List (Clean & Simple) */}
      {activeVariant === 'minimal-list' && (
        <section id="impact-dashboard" className="py-24" style={{ backgroundColor: BRAND_COLORS.bgWhite }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center mb-20">
              <h2 className={`${TYPOGRAPHY.section} mb-4`} style={{ 
                color: BRAND_COLORS.textPrimary, 
                fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" 
              }}>
                {t("homeSections.impactDashboard.trackYourImpact")}
              </h2>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: BRAND_COLORS.textSecondary }}>
                {t("homeSections.impactDashboard.everythingYouNeed")}
              </p>
            </div>

            {/* Minimal Feature List */}
            <div className="space-y-16">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="grid md:grid-cols-2 gap-12 items-center"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Alternate layout */}
                  {index % 2 === 0 ? (
                    <>
                      <div>
                        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4" 
                             style={{ backgroundColor: BRAND_COLORS.bgCool, color: BRAND_COLORS.textMuted }}>
                          {feature.step}
                        </div>
                        <h3 className="text-3xl font-bold mb-4" style={{ color: BRAND_COLORS.textPrimary }}>
                          {feature.title}
                        </h3>
                        <p className="text-lg leading-relaxed mb-6" style={{ color: BRAND_COLORS.textSecondary }}>
                          {feature.content}
                        </p>
                      </div>
                      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl overflow-hidden shadow-lg md:order-1" style={{ border: `1px solid ${BRAND_COLORS.borderSubtle}` }}>
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                      <div className="md:order-2">
                        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4" 
                             style={{ backgroundColor: BRAND_COLORS.bgCool, color: BRAND_COLORS.textMuted }}>
                          {feature.step}
                        </div>
                        <h3 className="text-3xl font-bold mb-4" style={{ color: BRAND_COLORS.textPrimary }}>
                          {feature.title}
                        </h3>
                        <p className="text-lg leading-relaxed mb-6" style={{ color: BRAND_COLORS.textSecondary }}>
                          {feature.content}
                        </p>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="max-w-3xl mx-auto text-center mt-20 p-10 rounded-2xl" style={{ backgroundColor: BRAND_COLORS.bgBeige }}>
              <h3 className="text-2xl font-bold mb-3" style={{ color: BRAND_COLORS.textPrimary }}>
                {t("homeSections.impactDashboard.readyToAmplify")}
              </h3>
              <p className="text-base mb-6" style={{ color: BRAND_COLORS.textSecondary }}>
                {t("homeSections.impactDashboard.joinAsFoundingMember")}
              </p>
              <Button 
                size="lg"
                className="text-white font-semibold px-8"
                style={{ backgroundColor: BRAND_COLORS.primaryOrange }}
                asChild
              >
                <Link href="https://tally.so/r/m6MqAe" target="_blank">
                  {t("homeSections.impactDashboard.joinWaitlist")}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>

          </div>
        </section>
      )}
    </>
  );
}