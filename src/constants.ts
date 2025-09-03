import { ChapterStatus } from './types';

export const APP_NAME = "Learnixus";

export const LIGHT_ACCENT_COLOR = 'indigo-500'; // Using Tailwind shade
export const DARK_ACCENT_COLOR = 'sky-400';    // Using Tailwind shade

// Using 500 shades for vibrancy, can be adjusted for softness if needed.
// These are background classes, text on them should be light (e.g. text-white or light shade of the color)
export const SUBJECT_COLORS: string[] = [
  'bg-sky-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500',
  'bg-amber-500', 'bg-teal-500', 'bg-fuchsia-500', 'bg-lime-500',
  'bg-cyan-500', 'bg-pink-500', 'bg-purple-500', 'bg-yellow-500' 
]; 

export const CHAPTER_STATUS_OPTIONS: ChapterStatus[] = [
  ChapterStatus.NotStarted,
  ChapterStatus.InProgress,
  ChapterStatus.Completed,
];

// Refined status styles for better clarity and modern feel
export const STATUS_STYLES_LIGHT: Record<ChapterStatus, {textColor: string, bgColor: string, borderColor: string, iconColor: string}> = {
  [ChapterStatus.NotStarted]: { textColor: 'text-slate-600', bgColor: 'bg-slate-100', borderColor: 'border-slate-300', iconColor: 'text-slate-500'},
  [ChapterStatus.InProgress]: { textColor: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-400', iconColor: 'text-amber-600'},
  [ChapterStatus.Completed]: { textColor: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-400', iconColor: 'text-emerald-600'},
};

export const STATUS_STYLES_DARK: Record<ChapterStatus, {textColor: string, bgColor: string, borderColor: string, iconColor: string}> = {
  [ChapterStatus.NotStarted]: { textColor: 'text-slate-400', bgColor: 'bg-slate-700', borderColor: 'border-slate-600', iconColor: 'text-slate-500'},
  [ChapterStatus.InProgress]: { textColor: 'text-yellow-400', bgColor: 'bg-yellow-700/60', borderColor: 'border-yellow-600/80', iconColor: 'text-yellow-500'},
  [ChapterStatus.Completed]: { textColor: 'text-green-400', bgColor: 'bg-green-700/60', borderColor: 'border-green-600/80', iconColor: 'text-green-500'},
};

export const TASK_STATUS_STYLES_LIGHT: Record<string, {border: string, text: string, buttonHover: string}> = {
  pending: { border: 'border-slate-300', text: 'text-slate-600', buttonHover: 'hover:bg-slate-500/20'},
  ongoing: { border: 'border-sky-400', text: 'text-sky-600', buttonHover: 'hover:bg-sky-500/20'},
  completed: { border: 'border-emerald-400', text: 'text-emerald-600 line-through', buttonHover: 'hover:bg-emerald-500/20'},
  dropped: { border: 'border-rose-400', text: 'text-rose-600 line-through', buttonHover: 'hover:bg-rose-500/20'},
};

export const TASK_STATUS_STYLES_DARK: Record<string, {border: string, text: string, buttonHover: string}> = {
  pending: { border: 'border-slate-700', text: 'text-slate-400', buttonHover: 'hover:bg-slate-500/20'},
  ongoing: { border: 'border-sky-600/80', text: 'text-sky-400', buttonHover: 'hover:bg-sky-500/20'},
  completed: { border: 'border-green-600/80', text: 'text-green-400 line-through', buttonHover: 'hover:bg-green-500/20'},
  dropped: { border: 'border-red-600/80', text: 'text-red-400 line-through', buttonHover: 'hover:bg-red-500/20'},
};


export const STUDY_LEVEL_OPTIONS: string[] = [
  'Primary School (Classes 1-5)',
  'Middle School (Classes 6-8)',
  'Secondary School (Classes 9-10)',
  'Senior Secondary School (Classes 11-12)',
  'College/University (Higher Education)',
  'Working Professional (Continuing Education / Skill Development)',
  'Other / Prefer not to say',
];

export const NIRF_COLLEGES_INDIA_TOP_50: string[] = [ // As of a recent ranking, example list
  "Indian Institute of Technology Madras",
  "Indian Institute of Science Bangalore",
  "Indian Institute of Technology Delhi",
  "Indian Institute of Technology Bombay",
  "Indian Institute of Technology Kanpur",
  "All India Institute of Medical Sciences, Delhi",
  "Indian Institute of Technology Kharagpur",
  "Indian Institute of Technology Roorkee",
  "Indian Institute of Technology Guwahati",
  "Jawaharlal Nehru University, New Delhi",
  "Banaras Hindu University, Varanasi",
  "University of Hyderabad",
  "Calcutta University, Kolkata",
  "Manipal Academy of Higher Education, Manipal",
  "Amrita Vishwa Vidyapeetham, Coimbatore",
  "Jamia Millia Islamia, New Delhi",
  "Saveetha Institute of Medical and Technical Sciences, Chennai",
  "Jadavpur University, Kolkata",
  "Vellore Institute of Technology, Vellore",
  "Aligarh Muslim University, Aligarh",
  "University of Delhi",
  "National Institute of Technology Tiruchirappalli",
  "Anna University, Chennai",
  "Indian Institute of Technology Hyderabad",
  "Bharathiar University, Coimbatore",
  "National Institute of Technology Rourkela",
  "Indian Institute of Technology (Indian School of Mines), Dhanbad",
  "Siksha 'O' Anusandhan, Bhubaneswar",
  "Panjab University, Chandigarh",
  "Indian Institute of Technology Indore",
  "Tata Institute of Fundamental Research, Mumbai",
  "King George's Medical University, Lucknow",
  "Kalinga Institute of Industrial Technology, Bhubaneswar",
  "Indian Institute of Science Education and Research, Pune",
  "Sri Ramachandra Institute of Higher Education and Research, Chennai",
  "National Institute of Technology Karnataka, Surathkal",
  "Institute of Chemical Technology, Mumbai",
  "Thapar Institute of Engineering and Technology, Patiala",
  "Osmania University, Hyderabad",
  "S.R.M. Institute of Science and Technology, Chennai",
  "Birla Institute of Technology & Science, Pilani",
  "PSG College of Technology, Coimbatore",
  "Indian Institute of Management Ahmedabad",
  "Indian Institute of Management Bangalore",
  "Indian Institute of Management Calcutta",
  "Delhi Technological University, Delhi",
  "Savitribai Phule Pune University",
  "Indian Agricultural Research Institute, New Delhi",
  "Christian Medical College, Vellore",
  "Shanmugha Arts, Science, Technology & Research Academy (SASTRA), Thanjavur"
];

export const OTHER_COLLEGE_PLACEHOLDER = "Other / Not in Top List"; // Used if user types a custom college not in NIRF list

export const POPULAR_INDIAN_EXAMS: { key: string; name: string; group: string }[] = [
  { key: 'jee', name: 'JEE (Main & Advanced)', group: 'Engineering Entrance' },
  { key: 'neet_ug', name: 'NEET (UG)', group: 'Medical Entrance' },
  { key: 'cat', name: 'CAT (Common Admission Test)', group: 'MBA Entrance' },
  { key: 'cuet_ug', name: 'CUET (UG)', group: 'University Entrance (Undergraduate)' },
  { key: 'cuet_pg', name: 'CUET (PG)', group: 'University Entrance (Postgraduate)' },
  { key: 'upsc_cse', name: 'UPSC Civil Services Exam (CSE)', group: 'Government/Civil Services' },
  { key: 'ssc_cgl', name: 'SSC CGL (Combined Graduate Level)', group: 'Government/Civil Services' },
  { key: 'ibps_po', name: 'IBPS PO (Probationary Officer)', group: 'Banking' },
  { key: 'gate', name: 'GATE (Graduate Aptitude Test in Engineering)', group: 'Post-Graduation/PSU' },
  { key: 'clat', name: 'CLAT (Common Law Admission Test)', group: 'Law Entrance'},
  { key: 'nda', name: 'NDA (National Defence Academy)', group: 'Defence Services'},
  { key: 'other_competitive', name: 'Other Competitive Exam', group: 'Other'},
];

export const EXAM_PREP_OTHER_KEY = 'other_competitive';
export const EXAM_PREP_GENERAL_FINALS_KEY = 'general_final_exams';
export const EXAM_GOAL_NONE_KEY = 'none'; // For explicitly stating no specific exam prep