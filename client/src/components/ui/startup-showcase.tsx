import React from 'react';
import { FeatureSteps } from './feature-steps';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Project } from '@shared/schema';

interface StartupShowcaseProps {
  featuredProjects?: Project[];
}

export function StartupShowcase({ featuredProjects }: StartupShowcaseProps) {
  // Fetch featured projects in specific order (same as homepage)
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["projects-startup-showcase"],
    queryFn: async () => {
      // Define the specific order we want (same as case-study-modern-section)
      const projectOrder = ['ignis-careers', 'allika-eco-products', 'panjurli-labs', 'sanitrust-pads'];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'active')
        .eq('featured', true)
        .in('slug', projectOrder);
      
      if (error) throw error;
      
      // Sort the results according to our desired order
      const sortedProjects = projectOrder
        .map(slug => data?.find(project => project.slug === slug))
        .filter(Boolean) as Project[];
      
      return sortedProjects;
    },
    retry: false,
    staleTime: Infinity,
  });

  // Default featured startups with fallback data
  const defaultFeatures = [
    {
      step: 'Ignis Careers',
      title: 'Education & Employment',
      content: 'Empowering underprivileged youth with skills training and job placement opportunities. Creating pathways from education to meaningful employment.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    {
      step: 'Allika Eco Products',
      title: 'Sustainable Living',
      content: 'Promoting eco-friendly alternatives to everyday products. Building a community committed to sustainable consumption and environmental protection.',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2013&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    {
      step: 'Panjurli Labs',
      title: 'Clean Air Solutions',
      content: 'Developing innovative air purification technologies to combat pollution. Making clean air accessible to communities in need.',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
    },
    {
      step: 'Sanitrust Pads',
      title: 'Women\'s Health',
      content: 'Providing affordable, high-quality sanitary products to underserved communities. Breaking barriers to women\'s health and dignity.',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=2031&auto=format&fit=crop&ixlib=rb-4.0.3'
    }
  ];

  // Convert featured projects to feature format
  const features = projects.length > 0 
    ? projects.map(project => ({
        step: project.title,
        title: project.category,
        content: project.description,
        image: project.imageUrl || 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
      }))
    : defaultFeatures;

  return (
    <section className="py-20 bg-white">
      <FeatureSteps 
        features={features}
        title="Become part of our social enterprise community"
        autoPlayInterval={4000}
        imageHeight="h-[500px]"
        className="bg-gradient-to-br from-gray-50 to-white"
      />
    </section>
  );
}
