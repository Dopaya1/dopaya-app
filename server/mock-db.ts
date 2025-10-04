// Mock database for local preview
export const mockProjects = [
  {
    id: '1',
    title: 'Clean Water for Rural Communities',
    description: 'Providing sustainable water solutions to underserved communities',
    category: 'Water & Sanitation',
    location: 'India',
    target_amount: 50000,
    current_amount: 25000,
    image_url: '/api/placeholder/400/300',
    impact_description: '1000 people will have access to clean water',
    status: 'active'
  },
  {
    id: '2', 
    title: 'Education for Every Child',
    description: 'Supporting quality education in rural schools',
    category: 'Education',
    location: 'Kenya',
    target_amount: 30000,
    current_amount: 18000,
    image_url: '/api/placeholder/400/300',
    impact_description: '500 children will receive quality education',
    status: 'active'
  }
];

export const mockUser = {
  id: '1',
  email: 'demo@dopaya.com',
  total_impact_points: 1250,
  total_donated: 125,
  rank: 'Changemaker',
  join_date: '2025-01-01'
};

// Mock API responses for preview
export const mockAPI = {
  getProjects: () => Promise.resolve(mockProjects),
  getUser: () => Promise.resolve(mockUser),
  getUserStats: () => Promise.resolve({
    total_impact_points: 1250,
    total_donated: 125,
    projects_supported: 3,
    current_rank: 'Changemaker'
  })
};