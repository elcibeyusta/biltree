// Normalize API base URL - ensure it's a valid absolute URL
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
// Fix common mistake: http:localhost -> http://localhost
export const API_BASE_URL = (() => {
  let url = rawApiUrl;
  
  // Fix missing // after http: or https:
  if (url.startsWith('http:')) {
    url = url.replace(/^http:/, 'http://');
  }
  if (url.startsWith('https:')) {
    url = url.replace(/^https:/, 'https://');
  }
  
  // Ensure URL doesn't start with http:// or https:// if it doesn't already
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // If it's a relative URL, assume http://localhost
    if (url.startsWith('/')) {
      url = `http://localhost:8000${url}`;
    } else {
      url = `http://${url}`;
    }
  }
  
  // Remove trailing slash to avoid double-slash issues with axios
  return url.replace(/\/+$/, '');
})();

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
  // EĞİTİM FAKÜLTESİ (Education Faculty)
  { value: 'EDU_PRIMARY', labelKey: 'departments.EDU_PRIMARY' },
  { value: 'EDU_SCIENCES', labelKey: 'departments.EDU_SCIENCES' },
  { value: 'EDU_TEFL', labelKey: 'departments.EDU_TEFL' },
  
  // FEN FAKÜLTESİ (Science Faculty)
  { value: 'PHYS', labelKey: 'departments.PHYS' },
  { value: 'CHEM', labelKey: 'departments.CHEM' },
  { value: 'MATH', labelKey: 'departments.MATH' },
  { value: 'MBG', labelKey: 'departments.MBG' },
  
  // GÜZEL SANATLAR, TASARIM VE MİMARLIK FAKÜLTESİ (Fine Arts, Design and Architecture Faculty)
  { value: 'GD', labelKey: 'departments.GD' },
  { value: 'FA', labelKey: 'departments.FA' },
  { value: 'IAED', labelKey: 'departments.IAED' },
  { value: 'CD', labelKey: 'departments.CD' },
  { value: 'UDLA', labelKey: 'departments.UDLA' },
  { value: 'ARCH', labelKey: 'departments.ARCH' },
  
  // İKTİSADİ, İDARİ VE SOSYAL BİLİMLER FAKÜLTESİ (Economics, Administrative and Social Sciences Faculty)
  { value: 'ECON', labelKey: 'departments.ECON' },
  { value: 'PSYC', labelKey: 'departments.PSYC' },
  { value: 'POL', labelKey: 'departments.POL' },
  { value: 'HIST', labelKey: 'departments.HIST' },
  { value: 'IR', labelKey: 'departments.IR' },
  
  // İNSANİ BİLİMLER VE EDEBİYAT FAKÜLTESİ (Humanities and Literature Faculty)
  { value: 'ACL', labelKey: 'departments.ACL' },
  { value: 'ARCHAE', labelKey: 'departments.ARCHAE' },
  { value: 'PHIL', labelKey: 'departments.PHIL' },
  { value: 'ELIT', labelKey: 'departments.ELIT' },
  { value: 'TRANS', labelKey: 'departments.TRANS' },
  { value: 'TLIT', labelKey: 'departments.TLIT' },
  
  // İŞLETME FAKÜLTESİ (Business Faculty)
  { value: 'BUS', labelKey: 'departments.BUS' },
  
  // HUKUK FAKÜLTESİ (Law Faculty)
  { value: 'LAW', labelKey: 'departments.LAW' },
  
  // MÜHENDİSLİK FAKÜLTESİ (Engineering Faculty)
  { value: 'CS', labelKey: 'departments.CS' },
  { value: 'EE', labelKey: 'departments.EE' },
  { value: 'IE', labelKey: 'departments.IE' },
  { value: 'ME', labelKey: 'departments.ME' },
  
  // MÜZİK VE SAHNE SANATLARI FAKÜLTESİ (Music and Performing Arts Faculty)
  { value: 'MUSIC', labelKey: 'departments.MUSIC' },
  { value: 'THEATRE', labelKey: 'departments.THEATRE' },
  
  // UYGULAMALI BİLİMLER FAKÜLTESİ (Applied Sciences Faculty)
  { value: 'IST', labelKey: 'departments.IST' },
  { value: 'TOH', labelKey: 'departments.TOH' },
] as const;

export const STUDY_LEVELS = [
  { value: 'PREP', labelKey: 'studyLevels.PREP' },
  { value: 'UG', labelKey: 'studyLevels.UG' },
  { value: 'GR', labelKey: 'studyLevels.GR' },
  { value: 'PHD', labelKey: 'studyLevels.PHD' },
] as const;

