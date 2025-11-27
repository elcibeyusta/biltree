export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MEETING: '/meeting',
  ADMIN: '/admin',
} as const;

export const DEPARTMENTS = [
  { value: 'CS', label: 'Computer Science' },
  { value: 'EE', label: 'Electrical and Electronics Engineering' },
  { value: 'IE', label: 'Industrial Engineering' },
  { value: 'ME', label: 'Mechanical Engineering' },
  { value: 'CE', label: 'Civil Engineering' },
  { value: 'CHE', label: 'Chemical Engineering' },
  { value: 'PHYS', label: 'Physics' },
  { value: 'MATH', label: 'Mathematics' },
  { value: 'ECON', label: 'Economics' },
  { value: 'PSYC', label: 'Psychology' },
  { value: 'LAW', label: 'Law' },
  { value: 'MUSIC', label: 'Music' },
  { value: 'ART', label: 'Art, Design and Architecture' },
  { value: 'MAN', label: 'Management' },
  { value: 'POL', label: 'Political Science' },
  { value: 'LIT', label: 'Literature' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const STUDY_LEVELS = [
  { value: 'UG', label: 'Undergraduate' },
  { value: 'GR', label: 'Graduate' },
  { value: 'PHD', label: 'PhD' },
] as const;

