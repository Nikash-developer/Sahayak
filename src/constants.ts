export const COLORS = {
  primary: '#006D6D', // Dark teal from UI
  secondary: '#FF8C42', // Orange from UI
  background: '#F8F9FA',
  text: '#1A1A1A',
  muted: '#6C757D',
  error: '#DC3545',
  success: '#28A745',
};

export const DISABILITY_OPTIONS = [
  { id: 'visual', label: 'Visual', description: 'Blindness, low vision, or color perception needs.', icon: 'Eye' },
  { id: 'hearing', label: 'Hearing', description: 'Deafness or hard of hearing assistance.', icon: 'Ear' },
  { id: 'motor', label: 'Motor', description: 'Mobility aids, wheelchair access, or dexterity support.', icon: 'Accessibility' },
  { id: 'cognitive', label: 'Cognitive', description: 'Learning, attention, or memory processing support.', icon: 'Brain' },
  { id: 'neurodivergent', label: 'Neurodivergent', description: 'Autism, ADHD, or sensory processing needs.', icon: 'Sparkles' },
  { id: 'speech', label: 'Speech', description: 'Speech-related assistance or non-verbal support.', icon: 'Mic' },
  { id: 'senior', label: 'Senior', description: 'Simplified interface for age-related navigation needs.', icon: 'User' },
  { id: 'temporary', label: 'Temporary', description: 'Recovering from injury or temporary mobility needs.', icon: 'Stethoscope' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say', description: 'Proceed with standard adaptive features.', icon: 'Info' },
];

export const HAZARD_TYPES = [
  { id: 'construction', label: 'Construction', icon: 'Hammer' },
  { id: 'flooding', label: 'Flooding', icon: 'Droplets' },
  { id: 'broken-path', label: 'Broken Path', icon: 'Map' },
  { id: 'obstacle', icon: 'Ban', label: 'Obstacle' },
  { id: 'poor-lighting', label: 'Poor Lighting', icon: 'Moon' },
  { id: 'steep-incline', label: 'Steep Incline', icon: 'ArrowUpRight' },
  { id: 'slippery', label: 'Slippery', icon: 'TriangleAlert' },
  { id: 'other', label: 'Other', icon: 'Ellipsis' },
];
