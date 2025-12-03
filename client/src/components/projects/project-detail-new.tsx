import { useEffect, useState } from "react";
import { Project } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { LanguageLink } from "@/components/ui/language-link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { getProjectTitle, getProjectDescription, getProjectSummary, getProjectMissionStatement, getProjectKeyImpact, getProjectAboutUs, getProjectImpactAchievements, getProjectFundUsage, getProjectSelectionReasoning, getProjectCountry, getProjectImpactUnit, getProjectImpactNoun, getProjectImpactVerb, hasGermanContent } from "@/lib/i18n/project-content";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DonationButton } from "@/components/donation/donation-button";
import { OptimizedImage, EagerOptimizedImage } from "@/components/ui/optimized-image";
import { 
  FaFacebook, 
  FaTwitter, 
  FaLinkedin, 
  FaInstagram, 
  FaEnvelope, 
  FaYoutube, 
  FaTiktok, 
  FaGlobe,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaUser,
  FaInfoCircle,
  FaLeaf,
  FaShareAlt
} from "react-icons/fa";
import { getCategoryColors } from "@/lib/category-colors";
import { MobileSlider } from "@/components/ui/mobile-slider";
import { SEOHead } from "@/components/seo/seo-head";
import acumenLogo from "@assets/SE_Backers/Acumen.png";
import dasraLogo from "@assets/SE_Backers/dasra.png";
import graymattersLogo from "@assets/SE_Backers/Graymatters Capital.png";
import millerCenterLogo from "@assets/SE_Backers/Miller Center.png";
import yunusLogo from "@assets/SE_Backers/Yunus Social business.png";

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetailNew({ project }: ProjectDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { t } = useTranslation();
  const { language } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(25);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showImpactInfo, setShowImpactInfo] = useState(false);
  
  // Get language-specific content
  const projectTitle = getProjectTitle(project, language);
  const projectDescription = getProjectDescription(project, language);
  const projectSummary = getProjectSummary(project, language);
  const projectMissionStatement = getProjectMissionStatement(project, language);
  const projectKeyImpact = getProjectKeyImpact(project, language);
  const projectAboutUs = getProjectAboutUs(project, language);
  const projectImpactAchievements = getProjectImpactAchievements(project, language);
  const projectFundUsage = getProjectFundUsage(project, language);
  const projectSelectionReasoning = getProjectSelectionReasoning(project, language);
  const projectCountry = getProjectCountry(project, language);
  const projectImpactUnit = getProjectImpactUnit(project, language);
  const projectImpactNoun = getProjectImpactNoun(project, language);
  const projectImpactVerb = getProjectImpactVerb(project, language);
  const hasGerman = hasGermanContent(project);
  
  // Handle scroll position for sticky bottom bar
  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky bar after scrolling down 300px
      const scrollPosition = window.scrollY;
      setShowStickyBar(scrollPosition > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fallback function for copying to clipboard on older browsers
  const copyToClipboardFallback = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      toast({
        title: "📋 Ready to Share!",
        description: "Text copied! Open Instagram and paste in your story or post.",
      });
      // Try to open Instagram app or web version
      setTimeout(() => {
        window.open('https://www.instagram.com/', '_blank');
      }, 1500);
    } catch (err) {
      toast({
        title: "❌ Copy Failed",
        description: "Please manually copy the text and share on Instagram.",
      });
    } finally {
      document.body.removeChild(textArea);
    }
  };

  // Function to handle social media sharing with proper text, link, and image
  const handleShare = async (platform: string) => {
    console.log(`Sharing to ${platform}...`);
    const url = window.location.href;
    const title = projectTitle;
    const shareMessage = `I am supporting ${title} to make a difference! 🌟`;
    const description = getProjectDescription(project, language)?.substring(0, 150) || 'Check out this amazing social impact project';
    const imageUrl = project.imageUrl || project.coverImage || '/src/assets/Dopaya Logo.png';
    
    // Try native Web Share API first (works great on mobile!)
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: shareMessage,
          text: `${shareMessage}\n\n${description}`,
          url: url
        });
        toast({
          title: "✅ Shared Successfully!",
          description: "Thanks for spreading the word!",
        });
        return;
      } catch (error) {
        console.log('Web Share API failed or cancelled:', error);
        // User cancelled or API not supported, continue to platform-specific
      }
    }
    
    let shareUrl = '';
    
    switch(platform) {
      case 'email':
        console.log('Opening email client...');
        const emailSubject = `Join me in supporting ${title}`;
        const emailBody = `Hi there!

I am supporting ${title} to make a difference! 🌟

${description}

Join me in making an impact - every contribution counts:
${url}

Together we can create positive change!`;
        shareUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        console.log('Email URL:', shareUrl);
        // Open in new window for better compatibility
        window.open(shareUrl, '_self');
        toast({
          title: "📧 Opening Email Client",
          description: "Your email app should open in a moment!",
        });
        return;
        
      case 'facebook':
        console.log('Opening Facebook sharer...');
        // Use Facebook's Dialog API which reads Open Graph tags from the page
        // This will show the image, title, and description automatically
        shareUrl = `https://www.facebook.com/dialog/share?app_id=YOUR_APP_ID&display=popup&href=${encodeURIComponent(url)}&redirect_uri=${encodeURIComponent(url)}`;
        // Fallback to basic sharer if Dialog API doesn't work
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        console.log('Facebook URL:', shareUrl);
        
        toast({
          title: "📘 Sharing to Facebook",
          description: "Facebook will pull the image and description from the page!",
        });
        break;
        
      case 'instagram':
        console.log('Handling Instagram sharing...');
        // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
        const instagramText = `${shareMessage}

${description}

Learn more and join the movement:
${url}

#SocialImpact #Dopaya #MakeADifference #${title.replace(/\s+/g, '')}`;
        console.log('Instagram text:', instagramText);
        
        // Try to copy to clipboard
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            console.log('Using modern clipboard API...');
            await navigator.clipboard.writeText(instagramText);
            console.log('Text copied successfully!');
          } else {
            console.log('Using fallback clipboard method...');
            copyToClipboardFallback(instagramText);
          }
          
          toast({
            title: "📸 Instagram Caption Ready!",
            description: "Caption copied to clipboard! Now:\n1. Save the project image\n2. Open Instagram\n3. Create a post with the image\n4. Paste the caption",
            duration: 8000,
          });
        } catch (error) {
          console.error('Clipboard failed:', error);
          copyToClipboardFallback(instagramText);
          toast({
            title: "📸 Instagram Caption Ready!",
            description: "Caption copied! Open Instagram and paste it with the project image.",
            duration: 6000,
          });
        }
        return;
        
      case 'twitter':
        const twitterText = `${shareMessage} ${url}`;
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
        break;
        
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
        
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  };
  
  // Create an array of images from project media fields
  const projectImages = [
    project.imageUrl, // Main image is always first
    project.image1 || '',
    project.image2 || '',
    project.image3 || '',
    project.image4 || '',
    project.image5 || '',
    project.image6 || ''
  ].filter(Boolean); // Remove empty strings
  
  // Calculate raised percentage
  const percentRaised = project.goal && project.goal > 0 ? 
    Math.min(100, Math.round((project.raised || 0) / project.goal * 100)) : 0;

  const impactPointsTiers = [
    { donation: 10, points: project.impactPointsMultiplier ? 10 * project.impactPointsMultiplier : 100 },
    { donation: 50, points: project.impactPointsMultiplier ? 50 * project.impactPointsMultiplier : 500 },
    { donation: 100, points: project.impactPointsMultiplier ? 100 * project.impactPointsMultiplier : 1000 },
    { donation: 500, points: project.impactPointsMultiplier ? 500 * project.impactPointsMultiplier : 5000 },
    { donation: 1000, points: project.impactPointsMultiplier ? 1000 * project.impactPointsMultiplier : 10000 },
  ];





  // Helper to render SDG goals with proper names
  const getSdgName = (goal: string) => {
    const sdgMap: Record<string, string> = {
      '1': 'No Poverty',
      '2': 'Zero Hunger',
      '3': 'Good Health and Well-being',
      '4': 'Quality Education',
      '5': 'Gender Equality',
      '6': 'Clean Water & Sanitation',
      '7': 'Affordable & Clean Energy',
      '8': 'Decent Work & Economic Growth',
      '9': 'Industry, Innovation & Infrastructure',
      '10': 'Reduced Inequalities',
      '11': 'Sustainable Cities & Communities',
      '12': 'Responsible Consumption & Production',
      '13': 'Climate Action',
      '14': 'Life Below Water',
      '15': 'Life on Land',
      '16': 'Peace, Justice & Strong Institutions',
      '17': 'Partnerships for the Goals'
    };
    
    return sdgMap[goal] || `Goal ${goal}`;
  };

  // Only display social links that are available
  const socialLinks = [
    { url: project.facebookUrl || undefined, icon: <FaFacebook size={20} />, name: 'Facebook' },
    { url: project.instagramUrl || undefined, icon: <FaInstagram size={20} />, name: 'Instagram' },
    { url: project.youtubeUrl || undefined, icon: <FaYoutube size={20} />, name: 'YouTube' },
    { url: project.linkedinUrl || undefined, icon: <FaLinkedin size={20} />, name: 'LinkedIn' },
    { url: project.tiktokUrl || undefined, icon: <FaTiktok size={18} />, name: 'TikTok' },
    { url: project.website || undefined, icon: <FaGlobe size={18} />, name: 'Website' }
  ].filter(link => link.url); // Only keep links that exist

  return (
    <>
      <SEOHead
        title={projectTitle}
        description={getProjectDescription(project, language) || projectSummary || `${t("projectDetail.supportProject")} ${projectTitle} auf Dopaya - Echten sozialen Impact schaffen und Belohnungen verdienen`}
        keywords={`${projectTitle}, social impact, ${project.category}, Dopaya, social enterprise, impact investing, rewards`}
        ogImage={project.coverImage ? `${window.location.origin}${project.coverImage}` : `${window.location.origin}/src/assets/Dopaya Logo.png`}
        ogType="article"
        canonicalUrl={`${window.location.origin}/project/${project.slug || project.id}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": projectTitle,
          "description": getProjectDescription(project, language) || projectSummary,
          "url": `${window.location.origin}/project/${project.slug || project.id}`,
          "image": project.coverImage ? `${window.location.origin}${project.coverImage}` : `${window.location.origin}/src/assets/Dopaya Logo.png`,
          "category": project.category,
          "foundingDate": project.foundedYear?.toString(),
          "location": project.location
        }}
      />
      
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${showStickyBar ? 'pb-24' : ''}`}>
        <LanguageLink href="/projects" className="inline-flex items-center text-primary hover:underline mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {t("projectDetail.backToProjects")}
        </LanguageLink>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Side (2/3 width) */}
        <div className="lg:col-span-8">
          <div className="mb-4">
            <div className={`inline-block px-2 py-1 ${getCategoryColors(project.category || '').badge} text-xs font-medium rounded mb-2`}>
              {project.category}
            </div>
            <h1 className="text-3xl font-bold text-dark font-heading">{projectTitle}</h1>
            <p className="text-neutral mt-2 whitespace-pre-line">
              {projectSummary}
            </p>
          </div>

          {/* Mission Statement */}
          {projectMissionStatement && (
            <div className="mb-6">
              <p className="text-neutral text-lg leading-relaxed max-w-none break-words whitespace-pre-line">
                {projectMissionStatement}
              </p>
            </div>
          )}

          <div className="mb-6">
            <EagerOptimizedImage
              src={projectImages[selectedImageIndex]} 
              alt={`${projectTitle} - Social impact project in ${project.category} category`} 
              width={800}
              height={600}
              quality={90}
              className="w-full h-auto max-h-[600px] object-contain rounded-lg"
              fallbackSrc="/placeholder-project.png"
            />
          </div>

          {projectImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mb-8">
              {projectImages.map((img, index) => (
                <OptimizedImage
                  key={index}
                  src={img} 
                  alt={`${projectTitle} - Image ${index + 1}`}
                  width={200}
                  height={133}
                  quality={80}
                  className={`w-full h-auto aspect-[3/2] object-cover rounded cursor-pointer border-2 ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          )}

          {/* About this Social Enterprise */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-dark font-heading mb-4">{t("projectDetail.aboutSocialEnterprise")}</h2>
            {projectDescription && (
              <p className="text-neutral mb-4 leading-relaxed">
                {projectDescription}
              </p>
            )}
            {projectAboutUs && (
              <p className="text-neutral mb-4 leading-relaxed">{projectAboutUs}</p>
            )}
          </div>

          {/* Trusted by Leading Organizations */}
          {project.slug === 'ignis-careers' && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-dark font-heading mb-4">{t("projectDetail.trustedByLeadingOrganizations")}</h2>
              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-5 gap-1 items-center justify-items-center">
                {[
                  {
                    name: 'Acumen',
                    logo: acumenLogo,
                    description: 'Global leader in social impact education and measurement frameworks'
                  },
                  {
                    name: 'Dasra',
                    logo: dasraLogo,
                    description: 'Strategic philanthropy foundation accelerating social change in India'
                  },
                  {
                    name: 'GrayMatters Capital',
                    logo: graymattersLogo,
                    description: 'Impact investment firm focused on early-stage social enterprises'
                  },
                  {
                    name: 'Miller Center',
                    logo: millerCenterLogo,
                    description: 'Global accelerator for social entrepreneurs'
                  },
                  {
                    name: 'Yunus Social Business',
                    logo: yunusLogo,
                    description: 'Pioneering social business model and impact investment'
                  }
                ].map((institution, index) => (
                  <div key={index} className="group relative">
                    <div className="bg-white rounded-lg p-2 shadow-sm border hover:shadow-md transition-shadow duration-200 w-full max-w-[120px]">
                      <OptimizedImage
                        src={institution.logo}
                        alt={`${institution.name} logo`}
                        width={120}
                        height={48}
                        quality={85}
                        className="w-full h-auto object-contain max-h-12 mx-auto"
                        fallbackSrc="/placeholder-logo.png"
                        onError={() => console.warn(`Failed to load logo for ${institution.name}`)}
                      />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{institution.name}</div>
                      <div className="text-gray-300 max-w-xs">{institution.description}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile: Slider Layout */}
              <div className="md:hidden">
                <MobileSlider
                  items={[
                    {
                      name: 'Acumen',
                      logo: acumenLogo,
                      description: 'Global leader in social impact education and measurement frameworks'
                    },
                    {
                      name: 'Dasra',
                      logo: dasraLogo,
                      description: 'Strategic philanthropy foundation accelerating social change in India'
                    },
                    {
                      name: 'GrayMatters Capital',
                      logo: graymattersLogo,
                      description: 'Impact investment firm focused on early-stage social enterprises'
                    },
                    {
                      name: 'Miller Center',
                      logo: millerCenterLogo,
                      description: 'Global accelerator for social entrepreneurs'
                    },
                    {
                      name: 'Yunus Social Business',
                      logo: yunusLogo,
                      description: 'Pioneering social business model and impact investment'
                    }
                  ]}
                  renderItem={(institution, index) => (
                    <div className="px-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border text-center">
                        <OptimizedImage
                          src={institution.logo}
                          alt={`${institution.name} logo`}
                          width={80}
                          height={48}
                          quality={85}
                          className="w-20 h-12 object-contain mx-auto mb-3"
                          fallbackSrc="/placeholder-logo.png"
                          onError={() => console.warn(`Failed to load logo for ${institution.name}`)}
                        />
                        <h3 className="font-semibold text-gray-900 mb-2">{institution.name}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{institution.description}</p>
                      </div>
                    </div>
                  )}
                  gap="gap-4"
                />
              </div>
            </div>
          )}

          {/* Impact Achievements */}
          {projectImpactAchievements && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-dark font-heading mb-4">{t("projectDetail.impactAchievements")}</h2>
              <div className="space-y-3">
                {projectImpactAchievements
                  .split(/[.•\-\*]\s*/)
                  .filter(point => point.trim().length > 0)
                  .map((point, idx) => {
                    // Clean up any remaining bullet points or formatting
                    const cleanedPoint = point.trim().replace(/^[•\-\*]\s*/, '');
                    return (
                      <div key={idx} className="flex items-start">
                        <FaCheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <p className="text-neutral leading-relaxed">{cleanedPoint}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* How Your Donation Will Be Used */}
          {projectFundUsage && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-dark font-heading mb-4">{t("projectDetail.howDonationUsed")}</h2>
              <div className="space-y-3">
                {projectFundUsage
                  .split(/[.•\-\*]\s*/)
                  .filter(point => point.trim().length > 0)
                  .map((point, idx) => {
                    // Clean up any remaining bullet points or formatting
                    const cleanedPoint = point.trim().replace(/^[•\-\*]\s*/, '');
                    return (
                      <div key={idx} className="flex items-start">
                        <FaCheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                        <p className="text-neutral leading-relaxed">{cleanedPoint}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}


        </div>

        {/* Right Side (1/3 width) */}
        <div className="lg:col-span-4 lg:mt-6 space-y-6">
          {/* Project Snapshot Box */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-dark mb-4">{t("projectDetail.projectSnapshot")}</h3>
            <div className="space-y-2">
              {/* Impact created - special green background */}
              {projectKeyImpact && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-neutral">
                    {projectKeyImpact}
                  </div>
                </div>
              )}
              
              {project.category && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral">{t("projectDetail.category")}</span>
                  <span className={`px-2 py-1 ${getCategoryColors(project.category).badge} rounded-full text-xs`}>
                    {project.category}
                  </span>
                </div>
              )}
              
              {projectCountry && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral">{t("projectDetail.location")}</span>
                  <span className="text-sm text-neutral">{projectCountry}</span>
                </div>
              )}
              
              {project.founderName && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral">{t("projectDetail.founder")}</span>
                  <span className="text-sm text-neutral">{project.founderName}</span>
                </div>
              )}
              
              {project.impactPointsMultiplier && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral">{t("projectDetail.impactMultiplier")}:</span>
                  <div className="flex items-center">
                    <span className="text-sm text-neutral">{project.impactPointsMultiplier}x</span>
                    <button 
                      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowImpactInfo(true)}
                      title={t("projectDetail.learnAboutImpactMultiplier")}
                    >
                      <FaInfoCircle className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Get in Touch Box */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-dark mb-4">{t("projectDetail.getInTouch")}</h3>
            <div className="space-y-2">
              {project.email && (
                <a 
                  href={`mailto:${project.email}`} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaEnvelope className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">E-Mail</span>
                  </div>
                </a>
              )}
              
              {project.website && (
                <a 
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaGlobe className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">Website</span>
                  </div>
                </a>
              )}
              
              {project.instagramUrl && (
                <a 
                  href={project.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaInstagram className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">Instagram</span>
                  </div>
                </a>
              )}
              
              {project.facebookUrl && (
                <a 
                  href={project.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaFacebook className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">Facebook</span>
                  </div>
                </a>
              )}
              
              {project.youtubeUrl && (
                <a 
                  href={project.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaYoutube className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">YouTube</span>
                  </div>
                </a>
              )}
              
              {project.linkedinUrl && (
                <a 
                  href={project.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaLinkedin className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">LinkedIn</span>
                  </div>
                </a>
              )}
              
              {project.tiktokUrl && (
                <a 
                  href={project.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FaTiktok className="text-orange-500 mr-3 h-4 w-4" />
                    <span className="text-sm font-medium text-neutral">TikTok</span>
                  </div>
                </a>
              )}
            </div>
          </div>
          
          {/* Impact Points Box */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            {/* Impact points info */}
            <div style={{ backgroundColor: '#F9FAFB' }} className="rounded-lg p-4 mb-6">
              <h3 className="font-bold text-dark mb-2">{t("projectDetail.earnImpactPoints")}</h3>
              <p className="text-sm text-neutral mb-3">
                {t("projectDetail.earnImpactPointsDescription", { multiplier: project.impactPointsMultiplier || 10 })}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">{t("projectDetail.donation")}</th>
                      <th className="text-left py-2 text-gray-600 font-medium">{t("projectDetail.points")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { donation: 10, points: (project.impactPointsMultiplier || 10) * 10 },
                      { donation: 50, points: (project.impactPointsMultiplier || 10) * 50 },
                      { donation: 100, points: (project.impactPointsMultiplier || 10) * 100 },
                      { donation: 250, points: (project.impactPointsMultiplier || 10) * 250 },
                      { donation: 500, points: (project.impactPointsMultiplier || 10) * 500 },
                      { donation: 1000, points: (project.impactPointsMultiplier || 10) * 1000 }
                    ].map((tier, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2">{language === 'de' ? `${tier.donation.toLocaleString()} $` : `$${tier.donation.toLocaleString()}`}</td>
                        <td className="py-2 font-medium text-primary">{tier.points.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Donate button */}
            <DonationButton 
              project={project}
              className="w-full py-6 text-lg font-bold"
            >
              {t("projectDetail.supportThisProject")}
            </DonationButton>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar for mobile support */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-3 z-50 safe-area-pb">
          {/* Mobile: Two equal-width buttons */}
          <div className="flex gap-2 md:hidden">
            {/* Share button - light gray bg, orange text */}
            {navigator.share && (
              <button
                onClick={() => handleShare('native')}
                className="flex-1 flex items-center justify-center gap-2 px-4 h-12 bg-gray-100 text-primary rounded-lg hover:bg-gray-200 transition-colors"
                title="Share"
              >
                <FaShareAlt className="h-4 w-4" />
                <span className="font-semibold">{t("projectDetail.share")}</span>
              </button>
            )}
            
            {/* Support button - orange bg, white text */}
            <DonationButton 
              project={project}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold h-12"
            >
              {t("projectDetail.supportThisProject")}
            </DonationButton>
          </div>

          {/* Desktop: Share icons + Support button */}
          <div className="hidden md:flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">{t("projectDetail.shareThisProject")}</span>
              
              <button
                onClick={() => handleShare('email')}
                className="p-2 text-gray-900 hover:text-primary transition-colors"
                title={t("projectDetail.shareViaEmail")}
              >
                <FaEnvelope className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 text-gray-900 hover:text-blue-600 transition-colors"
                title={t("projectDetail.shareOnFacebook")}
              >
                <FaFacebook className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('instagram')}
                className="p-2 text-gray-900 hover:text-pink-500 transition-colors"
                title={t("projectDetail.shareOnInstagram")}
              >
                <FaInstagram className="h-5 w-5" />
              </button>
            </div>
            
            <DonationButton 
              project={project}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2"
            >
              {t("projectDetail.supportThisProject")}
            </DonationButton>
          </div>
        </div>
      )}

      {/* Impact Multiplier Info Dialog */}
      <Dialog open={showImpactInfo} onOpenChange={setShowImpactInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projectDetail.impactMultiplier")}</DialogTitle>
            <DialogDescription>
              {t("projectDetail.impactMultiplierDescription", { multiplier: project.impactPointsMultiplier || 10 })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowImpactInfo(false)}>
              {t("projectDetail.gotIt")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Donation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("projectDetail.supportProject")} {projectTitle}</DialogTitle>
            <DialogDescription>
              {t("projectDetail.chooseAmountDonate", { multiplier: project.impactPointsMultiplier || 10 })}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-2 my-4">
            {[500, 1000, 5000, 10000, 25000].map((amount) => (
              <button
                key={amount}
                className={`p-2 border rounded-md ${
                  donationAmount === amount 
                    ? 'border-primary bg-primary/10' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setDonationAmount(amount)}
              >
                {language === 'de' ? `${amount.toLocaleString()} $` : `$${amount.toLocaleString()}`}
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom-amount">{t("projectDetail.orEnterCustomAmount")}</Label>
            <Input
              id="custom-amount"
              type="number"
              min="1"
              value={donationAmount}
              onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="bg-orange-50 p-3 rounded-md mt-4">
            <p className="text-sm">
              <span className="font-bold">{t("projectDetail.impactPointsYoullEarn")} </span> 
              <span className="text-primary font-bold">
                {donationAmount * (project.impactPointsMultiplier || 10)}
              </span>
            </p>
          </div>
          

        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}