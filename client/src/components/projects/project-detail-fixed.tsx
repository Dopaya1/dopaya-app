import { useEffect, useState } from "react";
import { Project, ProjectMedia } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope } from "react-icons/fa";

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(25);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
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

  // Fetch project media from the API
  const { data: projectMedia = [], isLoading: mediaLoading } = useQuery<ProjectMedia[]>({
    queryKey: [`/api/projects/${project.id}/media`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/projects/${project.id}/media`);
      return await res.json();
    }
  });
  
  // Create an array of images from project media
  const additionalImages = mediaLoading || projectMedia.length === 0 
    ? [project.imageUrl] // Fallback to just the main image if no media or still loading
    : [
        project.imageUrl, // Always include the main project image first
        ...projectMedia
          .filter(media => media.type === 'image') // Only include images
          // Don't sort by sortOrder since it doesn't exist in the database
          .map(media => media.url) // Extract the URL
      ].slice(0, 4); // Limit to 4 images total

  const impactPointsTiers = [
    { donation: 10, points: 100 },
    { donation: 50, points: 500 },
    { donation: 100, points: 1000 },
    { donation: 500, points: 5000 },
    { donation: 1000, points: 10000 },
  ];

  const donateMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await apiRequest("POST", `/api/projects/${project.id}/donate`, { amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/impact"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/supported-projects"] });
      toast({
        title: "Donation successful!",
        description: `Thank you for supporting ${project.title}. You've earned Impact Points!`,
      });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Donation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDonate = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    setIsDialogOpen(true);
  };

  const handleConfirmDonation = () => {
    donateMutation.mutate(donationAmount);
  };

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
            <div className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded mb-2">
              {project.category}
            </div>
            <h1 className="text-3xl font-bold text-dark font-heading">{project.title}</h1>
            <p className="text-neutral mt-2">
              {project.description}
            </p>
          </div>

          <div className="mb-6">
            <img 
              src={additionalImages[selectedImageIndex]} 
              alt={project.title} 
              className="w-full h-80 object-cover rounded-lg"
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mb-8">
            {additionalImages.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`${project.title} - Image ${index + 1}`}
                className={`w-full h-24 object-cover rounded cursor-pointer border-2 ${
                  selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-dark font-heading mb-4">About This Project</h2>
            {project.summary ? (
              <p className="text-neutral mb-4">{project.summary}</p>
            ) : null}
            <p className="text-neutral mb-4">
              {project.description}
            </p>
            {project.founderNames && (
              <p className="text-neutral">
                Founded by {project.founderNames} in {project.country}.
              </p>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-dark font-heading mb-4">The Impact</h2>
            <p className="text-neutral">
              By supporting this project, you're contributing directly to {project.category.toLowerCase()} initiatives 
              in {project.country}. Your donation helps make real-world change through 
              {project.sdgGoals?.length ? ` advancing SDG goals ${project.sdgGoals.join(', ')}` : ' sustainable development'}.
            </p>
          </div>

          {/* Achievements or Goals Section */}
          {project.achievements && Array.isArray(project.achievements) && project.achievements.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-dark font-heading mb-4">Achievements So Far</h2>
              <ul className="space-y-2 text-neutral">
                {project.achievements.map((achievement: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-1 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-dark font-heading mb-4">Project Goals</h2>
              <ul className="space-y-2 text-neutral">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-1 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Address key challenges in the {project.category} sector in {project.country}</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-1 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Create sustainable impact with a focus on {project.focusArea || 'community development'}</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-1 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Implement innovative solutions to address local challenges</span>
                </li>
              </ul>
            </div>
          )}

          {/* SDG Goals Section - Shown in a better format than the removed Sustainable Approach section */}
          {project.sdgGoals && project.sdgGoals.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-dark font-heading mb-4">UN Sustainable Development Goals</h2>
              <div className="flex flex-wrap gap-3">
                {project.sdgGoals.map((goal, index) => (
                  <div key={index} className="bg-white px-3 py-2 rounded-lg inline-flex items-center">
                    <span className="text-primary font-bold mr-2">SDG {goal}:</span>
                    <span className="text-dark">
                      {goal === '6' ? 'Clean Water & Sanitation' : 
                       goal === '7' ? 'Affordable & Clean Energy' :
                       goal === '13' ? 'Climate Action' :
                       goal === '12' ? 'Responsible Consumption' : 
                       `Goal ${goal}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Milestones Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-dark font-heading mb-4">Project Milestones</h2>
            <div className="relative">
              <div className="absolute left-4 h-full w-0.5 bg-gray-200 z-0"></div>
              <div className="relative z-10 space-y-6">
                {project.milestones && Array.isArray(project.milestones) && project.milestones.length > 0 ? (
                  // Use dynamic milestones if available
                  project.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="flex">
                      <div className={`flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full ${index === 0 ? 'bg-primary' : 'bg-neutral'} text-white`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-md font-medium text-dark">{milestone}</h3>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback with category-based generic milestones
                  <>
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-md font-medium text-dark">
                          {project.category === 'Energy' ? 'Develop sustainable energy solutions' :
                           project.category === 'Health' ? 'Implement health programs in target communities' :
                           project.category === 'Education' ? 'Launch educational initiatives' :
                           `Establish ${project.category} initiatives`}
                        </h3>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-neutral text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-md font-medium text-dark">Expand impact to reach more communities in {project.country}</h3>
                      </div>
                    </div>
                    <div className="flex">
                      <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-neutral text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-md font-medium text-dark">
                          {project.focusArea ? `Develop sustainable ${project.focusArea} programs` : 'Scale solutions for broader impact'}
                        </h3>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8 text-center">
            <Button 
              onClick={handleDonate} 
              size="lg"
              disabled={donateMutation.isPending}
            >
              {donateMutation.isPending ? "Processing..." : "Support This Project"}
            </Button>
            <p className="text-sm text-neutral mt-2">
              Every contribution earns you Impact Points that can be redeemed for rewards.
            </p>
          </div>
        </div>

        {/* Right Side (1/3 width) */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-xl font-bold text-dark font-heading mb-4">Social Impact</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-medium text-[#1a1a3a] mb-1">Why Dopaya?</h3>
                <p className="text-sm text-neutral mb-2">
                  We connect individual donors with high-impact social projects through our unique Impact Points system.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-[#1a1a3a] mb-1">How It Works</h3>
                <p className="text-sm text-neutral mb-2">
                  For every $1 you donate, you earn 10 Impact Points. Accumulate points and redeem them for exclusive rewards.
                  Earn additional points by completing your profile, referring friends, or participating in our community challenges.
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-[#1a1a3a] mb-2">Impact Point Tiers</h3>
              {impactPointsTiers.map((tier, index) => (
                <div key={index} className="bg-slate-50 p-3 rounded-md flex justify-between items-center">
                  <span className="text-sm">${tier.donation} Donation</span>
                  <span className="font-medium text-primary">{tier.points.toLocaleString()} Impact Points</span>
                </div>
              ))}
            </div>
            
            <div className="mt-5 text-center">
              <a href="https://tally.so/r/m6MqAe" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center text-sm">
                Learn more about our impact system
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Support {project.title}</DialogTitle>
            <DialogDescription>
              Enter the amount you'd like to donate. Every dollar contributes to real impact.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                min={1}
                value={donationAmount}
                onChange={(e) => setDonationAmount(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-md text-center">
              <p className="text-sm font-medium">Impact Points you'll earn:</p>
              <p className="text-2xl font-bold text-primary">{donationAmount * 10} Points</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDonation}
              disabled={donateMutation.isPending}
            >
              {donateMutation.isPending ? "Processing..." : "Confirm Donation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky bottom bar that appears on scroll */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 p-3 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex space-x-3 text-neutral">
              <button 
                onClick={() => handleShare('facebook')} 
                className="hover:text-primary"
                aria-label="Share on Facebook"
              >
                <FaFacebook size={20} />
              </button>
              <button 
                onClick={() => handleShare('twitter')} 
                className="hover:text-primary"
                aria-label="Share on Twitter"
              >
                <FaTwitter size={20} />
              </button>
              <button 
                onClick={() => handleShare('linkedin')} 
                className="hover:text-primary"
                aria-label="Share on LinkedIn"
              >
                <FaLinkedin size={20} />
              </button>
              <button 
                onClick={() => handleShare('instagram')} 
                className="hover:text-primary"
                aria-label="Share on Instagram"
              >
                <FaInstagram size={20} />
              </button>
              <button 
                onClick={() => handleShare('email')} 
                className="hover:text-primary"
                aria-label="Share via Email"
              >
                <FaEnvelope size={20} />
              </button>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleDonate} 
                size="default"
                disabled={donateMutation.isPending}
                className="font-bold bg-primary text-white hover:bg-primary/90"
              >
                {donateMutation.isPending ? "Processing..." : "Support this Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}