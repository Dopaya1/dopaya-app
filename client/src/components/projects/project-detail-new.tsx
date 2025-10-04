import { useEffect, useState } from "react";
import { Project } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { DonationButton } from "@/components/donation/donation-button";
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
  FaLeaf
} from "react-icons/fa";
import { getCategoryColors } from "@/lib/category-colors";

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetailNew({ project }: ProjectDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(25);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showImpactInfo, setShowImpactInfo] = useState(false);
  
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
  
  // Function to handle social media sharing
  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${project.title} on Dopaya - ${project.description.substring(0, 100)}...`;
    let shareUrl = '';
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct share URL, show a message instead
        toast({
          title: "Instagram Sharing",
          description: "Copy the link and share it on Instagram",
        });
        navigator.clipboard.writeText(url);
        return;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(`Dopaya Project: ${project.title}`)}&body=${encodeURIComponent(`Check out this amazing project: ${project.title}\n\n${project.description}\n\n${url}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
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
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${showStickyBar ? 'pb-24' : ''}`}>
      <Link href="/projects" className="inline-flex items-center text-primary hover:underline mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Projects
      </Link>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Left Side (2/3 width) */}
        <div className="lg:col-span-8">
          <div className="mb-4">
            <div className={`inline-block px-2 py-1 ${getCategoryColors(project.category || '').badge} text-xs font-medium rounded mb-2`}>
              {project.category}
            </div>
            <h1 className="text-3xl font-bold text-dark font-heading">{project.title}</h1>
            <p className="text-neutral mt-2">
              {project.summary}
            </p>
          </div>

          {/* Mission Statement */}
          {project.missionStatement && (
            <div className="mb-6">
              <p className="text-neutral text-lg leading-relaxed max-w-none break-words">
                {project.missionStatement}
              </p>
            </div>
          )}

          <div className="mb-6">
            <img 
              src={projectImages[selectedImageIndex]} 
              alt={`${project.title} - Social impact project in ${project.category} category`} 
              className="w-full h-auto max-h-[600px] object-contain rounded-lg"
            />
          </div>

          {projectImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mb-8">
              {projectImages.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`${project.title} - Image ${index + 1}`}
                  className={`w-full h-auto aspect-[3/2] object-cover rounded cursor-pointer border-2 ${
                    selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          )}

          {/* About This Social Project */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-dark font-heading mb-4">About This Social Project</h2>
            <p className="text-neutral mb-4 leading-relaxed">
              {project.description}
            </p>
            {project.aboutUs && (
              <p className="text-neutral mb-4 leading-relaxed">{project.aboutUs}</p>
            )}
          </div>

          {/* Impact Achievements */}
          {project.impactAchievements && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-dark font-heading mb-4">Impact Achievements</h2>
              <div className="space-y-3">
                {project.impactAchievements
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
          {project.fundUsage && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-dark font-heading mb-4">How Your Donation Will Be Used</h2>
              <div className="space-y-3">
                {project.fundUsage
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
            <h3 className="font-bold text-dark mb-4">Project Snapshot</h3>
            <div className="space-y-2">
              {/* Impact created - special green background */}
              {project.keyImpact && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-neutral">
                    {project.keyImpact}
                  </div>
                </div>
              )}
              
              {project.category && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral">Category:</span>
                  <span className={`px-2 py-1 ${getCategoryColors(project.category).badge} rounded-full text-xs`}>
                    {project.category}
                  </span>
                </div>
              )}
              
              {project.country && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral">Location:</span>
                  <span className="text-sm text-neutral">{project.country}</span>
                </div>
              )}
              
              {project.founderName && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral">Founder:</span>
                  <span className="text-sm text-neutral">{project.founderName}</span>
                </div>
              )}
              
              {project.impactPointsMultiplier && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-neutral">Impact Multiplier:</span>
                  <div className="flex items-center">
                    <span className="text-sm text-neutral">{project.impactPointsMultiplier}x</span>
                    <button 
                      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowImpactInfo(true)}
                      title="Learn more about Impact Multiplier"
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
            <h3 className="font-bold text-dark mb-4">Get in Touch</h3>
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
              <h3 className="font-bold text-dark mb-2">Earn Impact Points</h3>
              <p className="text-sm text-neutral mb-3">
                Earn {project.impactPointsMultiplier || 10}x impact points for every dollar donated to this project!
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-600 font-medium">Donation</th>
                      <th className="text-left py-2 text-gray-600 font-medium">Points</th>
                      <th className="text-left py-2 text-gray-600 font-medium">Bonus Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { donation: 10, points: (project.impactPointsMultiplier || 10) * 10, bonus: 10, level: "Supporter" },
                      { donation: 50, points: (project.impactPointsMultiplier || 10) * 50, bonus: 50, level: "Advocate" },
                      { donation: 100, points: (project.impactPointsMultiplier || 10) * 100, bonus: 100, level: "Changemaker" },
                      { donation: 250, points: (project.impactPointsMultiplier || 10) * 250, bonus: 250, level: "Impact Hero" },
                      { donation: 500, points: (project.impactPointsMultiplier || 10) * 500, bonus: 500, level: "Impact Legend" },
                      { donation: 1000, points: (project.impactPointsMultiplier || 10) * 1000, bonus: 1000, level: "Hall of Fame" }
                    ].map((tier, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2">${tier.donation.toLocaleString()}</td>
                        <td className="py-2 font-medium text-primary">{tier.points.toLocaleString()}</td>
                        <td className="py-2 font-medium text-orange-600">+{tier.bonus}</td>
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
              Support This Project
            </DonationButton>
          </div>
        </div>
      </div>

      {/* Sticky bottom bar for mobile support */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-4 flex justify-between items-center z-50">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600">Share this project</span>
            <a
              href={`mailto:?subject=Check out ${project.title}&body=I found this amazing social project: ${window.location.href}`}
              className="p-2 text-gray-600 hover:text-primary transition-colors"
              title="Share via Email"
            >
              <FaEnvelope className="h-4 w-4" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="Share on Facebook"
            >
              <FaFacebook className="h-4 w-4" />
            </a>
            <a
              href={`https://www.instagram.com/`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
              title="Share on Instagram"
            >
              <FaInstagram className="h-4 w-4" />
            </a>
          </div>
          
          <DonationButton 
            project={project}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2"
          >
            Support This Project
          </DonationButton>
        </div>
      )}

      {/* Impact Multiplier Info Dialog */}
      <Dialog open={showImpactInfo} onOpenChange={setShowImpactInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impact Multiplier</DialogTitle>
            <DialogDescription>
              When you donate to this social project, we multiply your Impact Points with {project.impactPointsMultiplier || 10}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowImpactInfo(false)}>
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Donation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support {project.title}</DialogTitle>
            <DialogDescription>
              Choose an amount to donate. You'll earn {project.impactPointsMultiplier || 10}x impact points for every dollar!
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
                ${amount.toLocaleString()}
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="custom-amount">Or enter a custom amount:</Label>
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
              <span className="font-bold">Impact points you'll earn: </span> 
              <span className="text-primary font-bold">
                {donationAmount * (project.impactPointsMultiplier || 10)}
              </span>
            </p>
          </div>
          

        </DialogContent>
      </Dialog>
    </div>
  );
}