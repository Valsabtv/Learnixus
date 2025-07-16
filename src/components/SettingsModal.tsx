
import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import { useTheme } from '../contexts/ThemeContext';
import { STUDY_LEVEL_OPTIONS, NIRF_COLLEGES_INDIA_TOP_50, LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR, OTHER_COLLEGE_PLACEHOLDER, POPULAR_INDIAN_EXAMS, EXAM_PREP_OTHER_KEY, EXAM_PREP_GENERAL_FINALS_KEY } from '../constants';
import { SunIcon, MoonIcon, ChevronDownIcon, UserCircleIcon, BookOpenIcon, PaintBrushIcon, ClipboardDocumentCheckIcon } from './IconComponents';
import { ExamPreparationInfo, ExamGoalType } from '../types';
import { supabase } from '../../supabaseClient';
import { useSession } from '@supabase/auth-helpers-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onUpdateName: (name: string) => void;
  currentStudyLevel: string;
  onUpdateStudyLevel: (level: string) => void;
  currentCollege: string;
  onUpdateCollege: (collegeName: string) => void;
  currentExamInfo: ExamPreparationInfo | null;
  onUpdateExamInfo: (examInfo: ExamPreparationInfo) => void;
  setStudyStrategies: React.Dispatch<React.SetStateAction<any[]>>;
}

const studyLevelsNotRequiringExamQuestion = [
  STUDY_LEVEL_OPTIONS[0], // 'Primary School (Classes 1-5)'
  STUDY_LEVEL_OPTIONS[1], // 'Middle School (Classes 6-8)'
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentName,
  onUpdateName,
  currentStudyLevel,
  onUpdateStudyLevel,
  currentCollege,
  onUpdateCollege,
  currentExamInfo,
  onUpdateExamInfo,
  setStudyStrategies,
}) => {
  const { theme, setTheme } = useTheme();
  const session = useSession();
  const user = session?.user;
  const [nameInput, setNameInput] = useState(currentName);
  const [studyLevelInput, setStudyLevelInput] = useState(currentStudyLevel);

  const [isCollegeLevel, setIsCollegeLevel] = useState(currentStudyLevel === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University')));
  const [isWellKnownCollege, setIsWellKnownCollege] = useState<'yes' | 'no' | ''>(() => {
    if (currentStudyLevel === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University'))) {
        if (currentCollege && NIRF_COLLEGES_INDIA_TOP_50.includes(currentCollege)) return 'yes';
        if (currentCollege) return 'no'; // Covers "Other / Not in Top List" or custom
    }
    return '';
  });

  const [collegeSearchTerm, setCollegeSearchTerm] = useState(
    currentCollege && NIRF_COLLEGES_INDIA_TOP_50.includes(currentCollege) ? currentCollege : ''
  );
  const [selectedCollegeState, setSelectedCollegeState] = useState(currentCollege);
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);
  const [nameSavedMessage, setNameSavedMessage] = useState(false);

  // Exam Prep State
  const [isPreparingForExam, setIsPreparingForExam] = useState<'yes' | 'no' | ''>(
    currentExamInfo?.goalType !== 'none' && currentExamInfo !== null ? 'yes' : (currentExamInfo === null ? '' : 'no')
  );
  const [examTypeCompetitive, setExamTypeCompetitive] = useState<'yes' | 'no' | ''>(
    currentExamInfo?.goalType === 'specific_competitive_exam' ? 'yes' :
    (currentExamInfo?.goalType === 'general_final_exams' ? 'no' : '')
  );
  const [selectedCompetitiveExamKey, setSelectedCompetitiveExamKey] = useState(currentExamInfo?.specificExamKey || '');
  const [otherCompetitiveExamName, setOtherCompetitiveExamName] = useState(
    (currentExamInfo?.goalType === 'specific_competitive_exam' && currentExamInfo.specificExamKey === EXAM_PREP_OTHER_KEY)
    ? currentExamInfo.customExamName || ''
    : ''
  );
   const [generalExamDescription, setGeneralExamDescription] = useState(
    currentExamInfo?.goalType === 'general_final_exams' ? currentExamInfo.customExamName || 'My School/College Finals' : 'My School/College Finals'
  );
  const [isExamDropdownOpen, setIsExamDropdownOpen] = useState(false);
  const [examSearchTerm, setExamSearchTerm] = useState('');

  const lightAccentName = LIGHT_ACCENT_COLOR.split('-')[0];
  const darkAccentName = DARK_ACCENT_COLOR.split('-')[0];

  const shouldShowExamSettings = useMemo(() => {
    return studyLevelInput && !studyLevelsNotRequiringExamQuestion.includes(studyLevelInput);
  }, [studyLevelInput]);


  useEffect(() => {
    if (isOpen) {
      setNameInput(currentName);
      setStudyLevelInput(currentStudyLevel);
      setSelectedCollegeState(currentCollege);
      setIsCollegeLevel(currentStudyLevel === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University')));

      const isNirf = NIRF_COLLEGES_INDIA_TOP_50.includes(currentCollege);
      if (currentStudyLevel === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University'))) {
        if (isNirf) {
            setIsWellKnownCollege('yes');
            setCollegeSearchTerm(currentCollege);
        } else if (currentCollege) {
            setIsWellKnownCollege('no');
            setCollegeSearchTerm('');
        } else {
            setIsWellKnownCollege('');
            setCollegeSearchTerm('');
        }
      } else {
        setIsWellKnownCollege('');
        setCollegeSearchTerm('');
      }

      setIsPreparingForExam(currentExamInfo?.goalType !== 'none' && currentExamInfo !== null ? 'yes' : (currentExamInfo === null ? '' : 'no'));
      setExamTypeCompetitive(currentExamInfo?.goalType === 'specific_competitive_exam' ? 'yes' : (currentExamInfo?.goalType === 'general_final_exams' ? 'no' : ''));
      setSelectedCompetitiveExamKey(currentExamInfo?.specificExamKey || '');
      setOtherCompetitiveExamName((currentExamInfo?.goalType === 'specific_competitive_exam' && currentExamInfo.specificExamKey === EXAM_PREP_OTHER_KEY) ? currentExamInfo.customExamName || '' : '');
      setGeneralExamDescription(currentExamInfo?.goalType === 'general_final_exams' ? currentExamInfo.customExamName || 'My School/College Finals' : 'My School/College Finals');
      const exam = POPULAR_INDIAN_EXAMS.find(e => e.key === currentExamInfo?.specificExamKey);
      setExamSearchTerm(exam ? exam.name : '');
    }
  }, [isOpen, currentName, currentStudyLevel, currentCollege, currentExamInfo]);

   useEffect(() => {
    const newIsCollegeLevel = studyLevelInput === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University'));
    setIsCollegeLevel(newIsCollegeLevel);

    if (!newIsCollegeLevel) {
      setIsWellKnownCollege('');
      setCollegeSearchTerm('');
      setSelectedCollegeState('');
      // onUpdateCollege(''); // Defer this to save all settings
    }
    
    if (!shouldShowExamSettings) {
        setIsPreparingForExam('');
        setExamTypeCompetitive('');
        setSelectedCompetitiveExamKey('');
        setOtherCompetitiveExamName('');
        // onUpdateExamInfo({ goalType: 'none' }); // Defer this to save all settings
    }
  }, [studyLevelInput, shouldShowExamSettings]);


  const filteredColleges = useMemo(() => {
    if (!collegeSearchTerm) return NIRF_COLLEGES_INDIA_TOP_50;
    return NIRF_COLLEGES_INDIA_TOP_50.filter(college =>
      college.toLowerCase().includes(collegeSearchTerm.toLowerCase())
    );
  }, [collegeSearchTerm]);

  const groupedExams = useMemo(() => {
    const groups: Record<string, { key: string; name: string; group: string }[]> = {};
    const examsToFilter = examSearchTerm
      ? POPULAR_INDIAN_EXAMS.filter(exam => exam.name.toLowerCase().includes(examSearchTerm.toLowerCase()))
      : POPULAR_INDIAN_EXAMS;

    examsToFilter.forEach(exam => {
      if (!groups[exam.group]) {
        groups[exam.group] = [];
      }
      groups[exam.group].push(exam);
    });
    return groups;
  }, [examSearchTerm]);

  const handleSaveName = async () => {
    if (nameInput.trim() && user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ username: nameInput.trim() })
          .eq('id', user.id);

        if (error) {
          console.error("Error updating name:", error.message);
          return;
        }

        onUpdateName(nameInput.trim());
        setStudyStrategies([]);
        setNameSavedMessage(true);
        setTimeout(() => setNameSavedMessage(false), 2000);
      } catch (error: any) {
        console.error("Error updating name:", error.message);
      }
    }
  };

  const handleCollegeSelection = (college: string) => {
    setSelectedCollegeState(college);
    setCollegeSearchTerm(college); // Update search term to selected college
    setIsCollegeDropdownOpen(false);
    // onUpdateCollege(college); // Defer to save all settings
  };

  const handleIsWellKnownChange = (value: 'yes' | 'no') => {
      setIsWellKnownCollege(value);
      if (value === 'no') {
          setSelectedCollegeState(OTHER_COLLEGE_PLACEHOLDER);
          setCollegeSearchTerm(''); // Clear search term if "No"
          // onUpdateCollege(OTHER_COLLEGE_PLACEHOLDER); // Defer
      } else {
          if (selectedCollegeState === OTHER_COLLEGE_PLACEHOLDER) {
            setSelectedCollegeState('');
            // onUpdateCollege(''); // Defer
          }
      }
  };

  const handleSaveAllSettings = () => {
    // Name is saved separately with its own button
    onUpdateStudyLevel(studyLevelInput);

    if (isCollegeLevel && isWellKnownCollege === 'yes' && selectedCollegeState) {
        onUpdateCollege(selectedCollegeState);
    } else if (isCollegeLevel && isWellKnownCollege === 'no') {
        onUpdateCollege(OTHER_COLLEGE_PLACEHOLDER);
    } else if (!isCollegeLevel) {
        onUpdateCollege('');
    } else if (isCollegeLevel && isWellKnownCollege === 'yes' && !selectedCollegeState) {
        onUpdateCollege(''); // Case where "yes" but nothing selected
    }


    let newExamInfo: ExamPreparationInfo = { goalType: 'none' };
    if (shouldShowExamSettings) {
        if (isPreparingForExam === 'yes') {
            if (examTypeCompetitive === 'yes') {
                newExamInfo = {
                    goalType: 'specific_competitive_exam',
                    specificExamKey: selectedCompetitiveExamKey,
                    customExamName: selectedCompetitiveExamKey === EXAM_PREP_OTHER_KEY ? otherCompetitiveExamName.trim() : undefined,
                };
            } else if (examTypeCompetitive === 'no') {
                newExamInfo = {
                    goalType: 'general_final_exams',
                    customExamName: generalExamDescription.trim() || "General School/College Finals",
                };
            }
        }
    } // If not shouldShowExamSettings, it remains 'none'
    onUpdateExamInfo(newExamInfo);
    onClose();
  };


  const handleExamKeySelection = (examKey: string) => {
    setSelectedCompetitiveExamKey(examKey);
    const exam = POPULAR_INDIAN_EXAMS.find(e => e.key === examKey);
    setExamSearchTerm(exam ? exam.name : '');
    setIsExamDropdownOpen(false);
  };

  const sectionTitleColor = theme === 'light' ? `text-slate-700` : theme === 'dark' ? `text-slate-200` : `text-gray-200`;
  const labelColor = theme === 'light' ? 'text-slate-600' : theme === 'dark' ? 'text-slate-400' : 'text-gray-400';
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' : theme === 'dark' ? 'bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500' : 'bg-gray-800 border-gray-700 focus:ring-sky-500 focus:border-sky-500';
  const inputTextColor = theme === 'light' ? 'text-slate-900 placeholder-slate-400' : theme === 'dark' ? 'text-slate-100 placeholder-slate-400' : 'text-gray-200 placeholder-gray-400';
  
  const buttonBg = theme === 'light' 
    ? `bg-gradient-to-r from-${lightAccentName}-500 to-${lightAccentName}-600 hover:from-${lightAccentName}-600 hover:to-${lightAccentName}-700`
    : `bg-gradient-to-r from-${darkAccentName}-500 to-${darkAccentName}-600 hover:from-${darkAccentName}-600 hover:to-${darkAccentName}-700`;
  const buttonFocusRing = theme === 'light' ? `focus:ring-${lightAccentName}-300` : `focus:ring-${darkAccentName}-300`;
  
  const secondaryButtonBg = theme === 'light' ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : theme === 'dark' ? 'bg-slate-600 hover:bg-slate-500 text-slate-200' : 'bg-gray-800 hover:bg-gray-700 text-gray-200';
  const secondaryButtonFocusRing = theme === 'light' ? 'focus:ring-slate-400' : 'focus:ring-slate-500';

  const radioBorderColor = theme === 'light' ? 'border-slate-300' : theme === 'dark' ? 'border-slate-600' : 'border-gray-700';
  const radioCheckedBorderColor = theme === 'light' ? `border-${lightAccentName}-500` : `border-${darkAccentName}-400`;
  const radioRingColor = theme === 'light' ? `ring-${lightAccentName}-500` : `ring-${darkAccentName}-400`;
  
  const dropdownBg = theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-800';
  const dropdownItemHoverBg = theme === 'light' ? `hover:bg-${lightAccentName}-50` : `hover:bg-${darkAccentName}-600`;
  const textColor = theme === 'light' ? 'text-slate-700' : theme === 'dark' ? 'text-slate-300' : 'text-gray-400';
  const subSectionBg = theme === 'light' ? 'bg-slate-50' : theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-900/50';
  const subSectionBorder = theme === 'light' ? 'border-slate-200' : theme === 'dark' ? 'border-slate-700' : 'border-gray-800';


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" maxWidthClass="max-w-lg">
      <div className="space-y-6 sm:space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2 -mr-2">

        {/* Profile Section */}
        <section aria-labelledby="profile-settings-title">
          <div className="flex items-center gap-2 mb-3">
            <UserCircleIcon className={`w-6 h-6 ${sectionTitleColor}`} />
            <h3 id="profile-settings-title" className={`text-lg font-semibold ${sectionTitleColor}`}>Profile</h3>
          </div>
          <div className={`space-y-4 p-4 rounded-md ${subSectionBg} border ${subSectionBorder}`}>
            <div>
              <label htmlFor="userNameSettings" className={`block text-sm font-medium ${labelColor} mb-1`}>
                Your Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="userNameSettings"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className={`flex-grow border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-sm`}
                />
                <button
                  onClick={handleSaveName}
                  className={`${secondaryButtonBg} font-semibold py-2.5 px-3.5 rounded-md text-sm shadow-sm hover:opacity-90 focus:outline-none focus:ring-1 ${secondaryButtonFocusRing} focus:ring-offset-1 ${theme === 'light' ? 'focus:ring-offset-slate-50' : 'focus:ring-offset-slate-700/50'}`}
                >
                  Save
                </button>
              </div>
              {nameSavedMessage && <p className={`text-xs mt-1 ${theme === 'light' ? `text-${lightAccentName}-600` : `text-${darkAccentName}-400`}`}>Name saved!</p>}
            </div>

            <div>
              <label htmlFor="studyLevelSettings" className={`block text-sm font-medium ${labelColor} mb-1`}>
                Study Level
              </label>
              <select
                id="studyLevelSettings"
                value={studyLevelInput}
                onChange={(e) => setStudyLevelInput(e.target.value)}
                className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-sm`}
              >
                {STUDY_LEVEL_OPTIONS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {isCollegeLevel && (
              <div className="space-y-3 pt-2">
                <div>
                    <p className={`block text-sm font-medium ${labelColor} mb-1.5`}>
                    Studying at a well-known Indian college (e.g., NIRF top-ranked)?
                    </p>
                    <div className="flex flex-col xs:flex-row gap-3">
                    {(['yes', 'no'] as Array<'yes' | 'no'>).map(option => (
                        <label key={option} className={`flex-1 flex items-center p-3 border ${radioBorderColor} rounded-lg cursor-pointer transition-all hover:opacity-80 ${isWellKnownCollege === option ? `${radioCheckedBorderColor} ring-1 ${radioRingColor}` : ''}`}>
                        <input
                            type="radio"
                            name="isWellKnownCollegeSettings"
                            value={option}
                            checked={isWellKnownCollege === option}
                            onChange={() => handleIsWellKnownChange(option)}
                            className={`h-4 w-4 text-${lightAccentName}-600 border-slate-400 focus:ring-${lightAccentName}-500 dark:text-${darkAccentName}-500 dark:border-slate-500 dark:focus:ring-${darkAccentName}-500 mr-2`}
                        />
                        <span className={`${textColor} text-sm`}>{option === 'yes' ? 'Yes, it is' : 'No / Other'}</span>
                        </label>
                    ))}
                    </div>
                </div>

                {isWellKnownCollege === 'yes' && (
                    <div className="relative">
                    <label htmlFor="collegeNameSettings" className={`block text-sm font-medium ${labelColor} mb-1`}>
                        Select your college:
                    </label>
                    <div className="relative">
                        <input
                        type="text"
                        id="collegeNameSettings"
                        value={selectedCollegeState && selectedCollegeState !== OTHER_COLLEGE_PLACEHOLDER ? selectedCollegeState : collegeSearchTerm}
                        onChange={(e) => {
                            setCollegeSearchTerm(e.target.value);
                            if (selectedCollegeState !== e.target.value) {
                                setSelectedCollegeState('');
                            }
                            setIsCollegeDropdownOpen(true);
                        }}
                        onFocus={() => setIsCollegeDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsCollegeDropdownOpen(false), 200)}
                        placeholder="Search or select college..."
                        className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors text-sm pr-10`}
                        />
                        <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} transition-transform ${isCollegeDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isCollegeDropdownOpen && (
                        <ul className={`absolute z-20 w-full mt-1 ${dropdownBg} border ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'} rounded-md shadow-lg max-h-48 overflow-auto text-sm`}>
                        {filteredColleges.length > 0 ? filteredColleges.map(college => (
                            <li
                            key={college}
                            onMouseDown={() => handleCollegeSelection(college)}
                            className={`p-2.5 cursor-pointer ${textColor} ${dropdownItemHoverBg} transition-colors`}
                            >
                            {college}
                            </li>
                        )) : (
                            <li className={`p-2.5 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>No matches</li>
                        )}
                        </ul>
                    )}
                    </div>
                )}
                 {isWellKnownCollege === 'no' && (
                 <p className={`text-xs ${theme==='light' ? 'text-slate-500' : 'text-slate-400'} italic`}>
                    General college level selected. AI will adapt accordingly.
                 </p>
               )}
              </div>
            )}
          </div>
        </section>

        {/* Exam Preparation Section */}
        {shouldShowExamSettings && (
        <section aria-labelledby="exam-prep-settings-title">
            <div className="flex items-center gap-2 mb-3">
                <ClipboardDocumentCheckIcon className={`w-6 h-6 ${sectionTitleColor}`} />
                <h3 id="exam-prep-settings-title" className={`text-lg font-semibold ${sectionTitleColor}`}>Exam Preparation</h3>
            </div>
            <div className={`space-y-4 p-4 rounded-md ${subSectionBg} border ${subSectionBorder}`}>
                <div>
                    <p className={`block text-sm font-medium ${labelColor} mb-2`}>
                        Are you currently preparing for any major exams?
                    </p>
                    <div className="flex flex-col xs:flex-row gap-3">
                        {(['yes', 'no'] as const).map(option => (
                        <label key={option} className={`flex-1 flex items-center p-3 border ${radioBorderColor} rounded-lg cursor-pointer transition-all hover:opacity-80 ${isPreparingForExam === option ? `${radioCheckedBorderColor} ring-1 ${radioRingColor}` : ''}`}>
                            <input type="radio" name="isPreparingForExamSettings" value={option} checked={isPreparingForExam === option} onChange={() => setIsPreparingForExam(option)} className={`h-4 w-4 text-${lightAccentName}-600 border-slate-400 focus:ring-${lightAccentName}-500 dark:text-${darkAccentName}-500 dark:border-slate-500 dark:focus:ring-${darkAccentName}-500 mr-2`}/>
                            <span className={`${textColor} text-sm`}>{option === 'yes' ? 'Yes' : 'No'}</span>
                        </label>
                        ))}
                    </div>
                </div>

                {isPreparingForExam === 'yes' && (
                    <div className="space-y-3 pt-2">
                        <p className={`block text-sm font-medium ${labelColor} mb-2`}>
                            What type of exam?
                        </p>
                        <div className="flex flex-col xs:flex-row gap-3">
                             <label className={`flex-1 flex items-center p-3 border ${radioBorderColor} rounded-lg cursor-pointer transition-all hover:opacity-80 ${examTypeCompetitive === 'no' ? `${radioCheckedBorderColor} ring-1 ${radioRingColor}` : ''}`}>
                                <input type="radio" name="examTypeSettings" value="no" checked={examTypeCompetitive === 'no'} onChange={() => setExamTypeCompetitive('no')} className={`h-4 w-4 text-${lightAccentName}-600 border-slate-400 focus:ring-${lightAccentName}-500 dark:text-${darkAccentName}-500 dark:border-slate-500 dark:focus:ring-${darkAccentName}-500 mr-2`}/>
                                <span className={`${textColor} text-sm`}>General Final Exam</span>
                            </label>
                             <label className={`flex-1 flex items-center p-3 border ${radioBorderColor} rounded-lg cursor-pointer transition-all hover:opacity-80 ${examTypeCompetitive === 'yes' ? `${radioCheckedBorderColor} ring-1 ${radioRingColor}` : ''}`}>
                                <input type="radio" name="examTypeSettings" value="yes" checked={examTypeCompetitive === 'yes'} onChange={() => setExamTypeCompetitive('yes')} className={`h-4 w-4 text-${lightAccentName}-600 border-slate-400 focus:ring-${lightAccentName}-500 dark:text-${darkAccentName}-500 dark:border-slate-500 dark:focus:ring-${darkAccentName}-500 mr-2`}/>
                                <span className={`${textColor} text-sm`}>Specific Competitive Exam</span>
                            </label>
                        </div>

                        {examTypeCompetitive === 'no' && (
                             <div>
                                <label htmlFor="generalExamDescriptionSettings" className={`block text-sm font-medium ${labelColor} mt-2 mb-1`}>
                                    Describe your final exams (optional):
                                </label>
                                <input
                                type="text"
                                id="generalExamDescriptionSettings"
                                value={generalExamDescription}
                                onChange={(e) => setGeneralExamDescription(e.target.value)}
                                placeholder="E.g., Annual School Finals"
                                className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-sm`}
                                />
                            </div>
                        )}

                        {examTypeCompetitive === 'yes' && (
                            <div className="relative mt-2">
                                <label htmlFor="competitiveExamSettings" className={`block text-sm font-medium ${labelColor} mb-1`}>
                                Select Competitive Exam:
                                </label>
                                 <div className="relative">
                                    <input
                                        type="text"
                                        id="competitiveExamSearchSettings"
                                        value={examSearchTerm}
                                        onChange={(e) => {
                                            setExamSearchTerm(e.target.value);
                                            if (selectedCompetitiveExamKey && POPULAR_INDIAN_EXAMS.find(ex => ex.key === selectedCompetitiveExamKey)?.name !== e.target.value) {
                                                setSelectedCompetitiveExamKey('');
                                            }
                                            setIsExamDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsExamDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsExamDropdownOpen(false), 200)}
                                        placeholder="Search or select exam..."
                                        className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors text-sm pr-10`}
                                    />
                                     <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} transition-transform ${isExamDropdownOpen ? 'rotate-180' : ''}`} />
                                 </div>
                                {isExamDropdownOpen && (
                                <ul className={`absolute z-20 w-full mt-1 ${dropdownBg} border ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'} rounded-md shadow-lg max-h-48 overflow-y-auto text-sm`}>
                                    {Object.keys(groupedExams).length > 0 ? Object.entries(groupedExams).map(([groupName, examsInGroup]) => (
                                    <React.Fragment key={groupName}>
                                        <li className={`px-2.5 py-1.5 text-xs font-semibold ${theme === 'light' ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-slate-700/50'} sticky top-0`}>{groupName}</li>
                                        {examsInGroup.map(exam => (
                                        <li
                                            key={exam.key}
                                            onMouseDown={() => handleExamKeySelection(exam.key)}
                                            className={`p-2.5 cursor-pointer ${textColor} ${dropdownItemHoverBg} transition-colors`}
                                        >
                                            {exam.name}
                                        </li>
                                        ))}
                                    </React.Fragment>
                                    )) : (
                                    <li className={`p-2.5 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>No matches found</li>
                                    )}
                                </ul>
                                )}
                            </div>
                        )}
                        {examTypeCompetitive === 'yes' && selectedCompetitiveExamKey === EXAM_PREP_OTHER_KEY && (
                            <div className="mt-2">
                                <label htmlFor="otherCompetitiveExamNameSettings" className={`block text-sm font-medium ${labelColor} mb-1`}>
                                Please specify the exam name:
                                </label>
                                <input
                                type="text"
                                id="otherCompetitiveExamNameSettings"
                                value={otherCompetitiveExamName}
                                onChange={(e) => setOtherCompetitiveExamName(e.target.value)}
                                placeholder="E.g., Olympiad, Regional Test"
                                className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-sm`}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
        )}

        {/* Theme Section */}
        <section aria-labelledby="theme-settings-title">
          <div className="flex items-center gap-2 mb-3">
            <PaintBrushIcon className={`w-6 h-6 ${sectionTitleColor}`} />
            <h3 id="theme-settings-title" className={`text-lg font-semibold ${sectionTitleColor}`}>Appearance</h3>
          </div>
          <div className={`p-4 rounded-md ${subSectionBg} border ${subSectionBorder}`}>
            <label className={`block text-sm font-medium ${labelColor} mb-2`}>
              Theme
            </label>
            <div className="flex items-center justify-start gap-3">
              {/* Light Mode Button */}
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center w-32 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${theme === 'light'
                    ? `bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-400 focus:ring-offset-slate-50`
                    : `bg-slate-100 text-slate-600 hover:bg-slate-200 focus:ring-slate-300 focus:ring-offset-slate-50`
                  }
                `}
                aria-label="Switch to Light Mode"
              >
                <SunIcon className="w-4 h-4 mr-1.5" /> Light Mode
              </button>

              {/* Dark Mode Button */}
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center w-32 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${theme === 'dark'
                    ? `bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500 focus:ring-offset-slate-700/50`
                    : `bg-slate-800 text-slate-300 hover:bg-slate-700 focus:ring-slate-600 focus:ring-offset-slate-800`
                  }
                `}
                aria-label="Switch to Dark Mode"
              >
                <MoonIcon className="w-4 h-4 mr-1.5" /> Dark Mode
              </button>

              {/* AMOLED Mode Button */}
              <button
                onClick={() => setTheme('amoled')}
                className={`flex items-center justify-center w-32 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${theme === 'amoled'
                    ? `bg-gray-900 text-gray-200 hover:bg-gray-800 focus:ring-gray-700 focus:ring-offset-black`
                    : `bg-gray-800 text-gray-300 hover:bg-gray-700 focus:ring-gray-700 focus:ring-offset-black`
                  }
                `}
                aria-label="Switch to AMOLED Mode"
              >
                <MoonIcon className="w-4 h-4 mr-1.5" /> AMOLED Mode
              </button>
            </div>
            <p className={`${textColor} text-xs mt-2`}>Current: {theme === 'light' ? 'Light Mode' : theme === 'dark' ? 'Dark Mode' : 'AMOLED Mode'}</p>
          </div>
        </section>
      </div>

      <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
        <button
          onClick={handleSaveAllSettings}
          className={`${buttonBg} text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-sm focus:outline-none focus:ring-2 ${buttonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : 'focus:ring-offset-slate-800'} hover:scale-[1.03]`}
        >
          Save & Close
        </button>
      </div>
    </Modal>
  );
};
