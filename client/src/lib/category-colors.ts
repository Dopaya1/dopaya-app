// Category color mapping for consistent styling across the application
export const getCategoryColors = (category: string) => {
  const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
    'Education': {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700'
    },
    'Energy': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-700'
    },
    'Environment': {
      bg: 'bg-green-50',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700'
    },
    'Conservation': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700'
    },
    'Health': {
      bg: 'bg-red-50',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-700'
    },
    'Finance': {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700'
    },
    'Agriculture': {
      bg: 'bg-lime-50',
      text: 'text-lime-700',
      badge: 'bg-lime-100 text-lime-700'
    },
    'Housing': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-700'
    },
    'Livelihood': {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      badge: 'bg-teal-100 text-teal-700'
    },
    'Sanitation': {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      badge: 'bg-cyan-100 text-cyan-700'
    },
    'Technology': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      badge: 'bg-indigo-100 text-indigo-700'
    },
    'Water': {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      badge: 'bg-sky-100 text-sky-700'
    },
    'Women Empowerment': {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      badge: 'bg-pink-100 text-pink-700'
    }
  };

  // Default color scheme for unknown categories - using a subtle color instead of gray
  const defaultColors = {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-700'
  };

  return colorMap[category] || defaultColors;
};