

import React, { useState, useMemo, useEffect } from 'react';
import { APP_NAME, STUDY_LEVEL_OPTIONS, NIRF_COLLEGES_INDIA_TOP_50, LIGHT_ACCENT_COLOR, DARK_ACCENT_COLOR, OTHER_COLLEGE_PLACEHOLDER, POPULAR_INDIAN_EXAMS, EXAM_PREP_OTHER_KEY, EXAM_PREP_GENERAL_FINALS_KEY, EXAM_GOAL_NONE_KEY } from '../constants';
import { BookOpenIcon, ChevronDownIcon } from './IconComponents';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { ExamPreparationInfo, ExamGoalType } from '../types';
import { supabase } from "../../supabaseClient";
import useLocalStorage from '../hooks/useLocalStorage';
import useUserData from '../hooks/useUserData'; 

interface InitialSetupPageProps {
  onSetupComplete: (name: string, studyLevel: string, college: string, examInfo: ExamPreparationInfo) => void;
  currentName: string;
  currentLevel: string;
  currentCollege: string;
  currentExamInfo: ExamPreparationInfo | null; // Added prop
  handleLogout: () => void;
}

const studyLevelsNotRequiringExamQuestion = [
  STUDY_LEVEL_OPTIONS[0], // 'Primary School (Classes 1-5)'
  STUDY_LEVEL_OPTIONS[1], // 'Middle School (Classes 6-8)'
];

const InitialSetupPage: React.FC<InitialSetupPageProps> = ({
    onSetupComplete,
    currentName,
    currentLevel,
    currentCollege,
    currentExamInfo, // Destructure new prop
    handleLogout
}) => {
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const [username, setUsername] = useUserData("username", "");
  const [userNameInput, setUserNameInput] = useState(currentName || '');
  const [selectedLevel, setSelectedLevel] = useState(currentLevel || '');
  const [isCollegeLevel, setIsCollegeLevel] = useState(currentLevel === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University')));

  const [isWellKnownCollege, setIsWellKnownCollege] = useState<'yes' | 'no' | ''>(() => {
    if (currentLevel === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University'))) {
        if (currentCollege && NIRF_COLLEGES_INDIA_TOP_50.includes(currentCollege)) return 'yes';
        if (currentCollege) return 'no'; // Covers "Other / Not in Top List" or custom
    }
    return '';
  });

  const [collegeSearchTerm, setCollegeSearchTerm] = useState(
    currentCollege && NIRF_COLLEGES_INDIA_TOP_50.includes(currentCollege) ? currentCollege : ''
  );
  const [finalSelectedCollege, setFinalSelectedCollege] = useState(currentCollege || '');
  const [isCollegeDropdownOpen, setIsCollegeDropdownOpen] = useState(false);

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


  const accentColor = theme === 'light' ? LIGHT_ACCENT_COLOR : DARK_ACCENT_COLOR;

  const canAskExamQuestion = useMemo(() => {
    return selectedLevel && !studyLevelsNotRequiringExamQuestion.includes(selectedLevel);
  }, [selectedLevel]);


  useEffect(() => {
     if (selectedLevel === STUDY_LEVEL_OPTIONS.find(opt => opt.includes('College/University'))) {
      setIsCollegeLevel(true);
    } else {
      setIsCollegeLevel(false);
      setIsWellKnownCollege('');
      setFinalSelectedCollege('');
      setCollegeSearchTerm('');
    }
    // Reset exam prep questions if level changes to one where it's not applicable
    if (!canAskExamQuestion) {
        setIsPreparingForExam('');
        setExamTypeCompetitive('');
        setSelectedCompetitiveExamKey('');
        setOtherCompetitiveExamName('');
    }
  }, [selectedLevel, canAskExamQuestion]);

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


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!userNameInput.trim()) {
    addNotification('Please enter your name.', 'warning');
    return;
  }
  if (userNameInput.trim().length < 3) {
    addNotification('Name must be at least 3 characters.', 'warning');
    return;
  }
  if (!selectedLevel) {
    addNotification('Please select your study level.', 'warning');
    return;
  }
  if (isCollegeLevel && isWellKnownCollege === '') {
    addNotification("Please indicate if you attend a well-known college or not.", 'warning');
    return;
  }
  if (isCollegeLevel && isWellKnownCollege === 'yes' && !finalSelectedCollege) {
    addNotification("Please select your college from the list.", 'warning');
    return;
  }
  if (isCollegeLevel && isWellKnownCollege === 'no' && !finalSelectedCollege) {
    addNotification("If not a well-known college, 'Other / Not in Top List' is selected. Proceed if this is correct.", 'info');
  }

  let examInfoToSave: ExamPreparationInfo = { goalType: 'none' };
  if (canAskExamQuestion) {
    if (isPreparingForExam === 'yes') {
      if (examTypeCompetitive === 'yes') {
        if (!selectedCompetitiveExamKey) {
          addNotification('Please select the competitive exam you are preparing for.', 'warning');
          return;
        }
        if (selectedCompetitiveExamKey === EXAM_PREP_OTHER_KEY && !otherCompetitiveExamName.trim()) {
          addNotification('Please specify the name of the "Other" competitive exam.', 'warning');
          return;
        }
        examInfoToSave = {
          goalType: 'specific_competitive_exam',
          specificExamKey: selectedCompetitiveExamKey,
          customExamName: selectedCompetitiveExamKey === EXAM_PREP_OTHER_KEY ? otherCompetitiveExamName.trim() : undefined,
        };
      } else if (examTypeCompetitive === 'no') {
        if (!generalExamDescription.trim()) {
          addNotification('Please provide a brief description for your general final exams.', 'warning');
          return;
        }
        examInfoToSave = {
          goalType: 'general_final_exams',
          customExamName: generalExamDescription.trim(),
        };
      } else {
        addNotification('Please specify the type of major exam you are preparing for.', 'warning');
        return;
      }
    } else if (isPreparingForExam === '') {
      addNotification('Please indicate if you are preparing for a major exam.', 'warning');
      return;
    }
  }

  // ✅ LocalStorage sync
  setUsername(userNameInput.trim());

  // ✅ Supabase profile update
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Error getting user:", userError?.message);
    addNotification("Could not fetch user from Supabase.", "error");
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .upsert({ 
      id: user.id, 
      username: userNameInput.trim(), 
      setup_complete: true,
      study_level: selectedLevel,
      college: finalSelectedCollege || '',
      exam_info: examInfoToSave
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("❌ Supabase update failed:", updateError.message);
    addNotification("Failed to save name to database.", "error");
  } else {
    console.log("✅ Username updated in Supabase");
  }

  onSetupComplete(userNameInput.trim(), selectedLevel, finalSelectedCollege || '', examInfoToSave);
};


  const handleWellKnownChange = (value: 'yes' | 'no') => {
    setIsWellKnownCollege(value);
    if (value === 'no') {
        setFinalSelectedCollege(OTHER_COLLEGE_PLACEHOLDER);
        setCollegeSearchTerm('');
    } else {
        if (finalSelectedCollege === OTHER_COLLEGE_PLACEHOLDER) {
            setFinalSelectedCollege(''); // Clear "Other" if user now says "Yes"
        }
    }
  };

  const handleExamSelection = (examKey: string) => {
    setSelectedCompetitiveExamKey(examKey);
    const exam = POPULAR_INDIAN_EXAMS.find(e => e.key === examKey);
    setExamSearchTerm(exam ? exam.name : '');
    setIsExamDropdownOpen(false);
  };


  const pageBg = theme === 'light' ? 'bg-slate-100' : theme === 'dark' ? 'bg-slate-900' : 'bg-black';
  const cardBg = theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-800' : 'bg-gray-900';
  const textColor = theme === 'light' ? 'text-slate-700' : theme === 'dark' ? 'text-slate-200' : 'text-gray-300';
  const headingColor = theme === 'light' ? 'text-slate-800' : theme === 'dark' ? 'text-slate-50' : 'text-gray-100';
  const appNameColor = theme === 'light' ? `text-${accentColor}-600` : `text-${accentColor}-400`;
  const inputBg = theme === 'light' ? 'bg-slate-50 border-slate-300 focus:ring-indigo-500 focus:border-indigo-500' : theme === 'dark' ? 'bg-slate-700 border-slate-600 focus:ring-sky-500 focus:border-sky-500' : 'bg-gray-800 border-gray-700 focus:ring-sky-500 focus:border-sky-500';
  const inputTextColor = theme === 'light' ? 'text-slate-900 placeholder-slate-400' : theme === 'dark' ? 'text-slate-100 placeholder-slate-400' : 'text-gray-200 placeholder-gray-400';
  const labelColor = theme === 'light' ? 'text-slate-600' : theme === 'dark' ? 'text-slate-300' : 'text-gray-400';
  const buttonBg = `bg-gradient-to-r from-${accentColor}-500 to-${accentColor}-600 hover:from-${accentColor}-600 hover:to-${accentColor}-700`;
  const buttonFocusRing = `focus:ring-${accentColor}-400`;
  const radioBorderColor = theme === 'light' ? 'border-slate-300' : theme === 'dark' ? 'border-slate-600' : 'border-gray-700';
  const radioCheckedBorderColor = theme === 'light' ? `border-${accentColor}-500` : `border-${accentColor}-400`;
  const radioRingColor = theme === 'light' ? `ring-${accentColor}-500` : `ring-${accentColor}-400`;
  const dropdownBg = theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-slate-700' : 'bg-gray-800';
  const dropdownItemHoverBg = theme === 'light' ? 'hover:bg-indigo-50' : theme === 'dark' ? 'hover:bg-sky-600' : 'hover:bg-gray-700';
  const subSectionBg = theme === 'light' ? 'bg-slate-50/70' : theme === 'dark' ? 'bg-slate-700/40' : 'bg-gray-900/40';
  const subSectionBorder = theme === 'light' ? 'border-slate-200' : theme === 'dark' ? 'border-slate-600' : 'border-gray-700';


  return (
    <div className={`min-h-screen ${pageBg} flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 ease-in-out animate-fadeIn`}>
      <div className={`w-full max-w-xl ${cardBg} p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl`}>
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <BookOpenIcon className={`w-16 h-16 sm:w-20 sm:h-20 mb-4 ${appNameColor}`} />
          <h1 className={`text-3xl sm:text-4xl font-bold ${headingColor}`}>Welcome to <span className={appNameColor}>{APP_NAME}</span>!</h1>
          <p className={`mt-2 text-sm sm:text-base ${textColor} text-center`}>Let's personalize your learning experience. Just a few details to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label htmlFor="userName" className={`block text-sm font-medium ${labelColor} mb-1.5`}>
              What's your name?
            </label>
            <input
              type="text"
              id="userName"
              value={userNameInput}
              onChange={(e) => setUserNameInput(e.target.value)}
              placeholder="E.g., Ada Lovelace"
              className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-base`}
              required
            />
          </div>

          <div>
            <label htmlFor="studyLevel" className={`block text-sm font-medium ${labelColor} mb-1.5`}>
              What's your current study level?
            </label>
            <select
              id="studyLevel"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-base`}
              required
            >
              <option value="" disabled>Select your level</option>
              {STUDY_LEVEL_OPTIONS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* College Specific Questions */}
          {isCollegeLevel && (
            <div className={`p-4 rounded-md space-y-4 ${subSectionBg} border ${subSectionBorder}`}>
              <p className={`block text-sm font-medium ${labelColor} -mb-2`}>
                Are you studying at a well-known Indian college (e.g., NIRF top-ranked)?
              </p>
              <div className="flex flex-col xs:flex-row gap-3">
                {(['yes', 'no'] as Array<'yes' | 'no'>).map(option => (
                  <label key={option} className={`flex-1 flex items-center p-3 border ${radioBorderColor} rounded-lg cursor-pointer transition-all hover:opacity-80 ${isWellKnownCollege === option ? `${radioCheckedBorderColor} ring-1 ${radioRingColor}` : ''}`}>
                    <input
                      type="radio"
                      name="isWellKnownCollege"
                      value={option}
                      checked={isWellKnownCollege === option}
                      onChange={() => handleWellKnownChange(option)}
                      className="h-4 w-4 text-indigo-600 border-slate-400 focus:ring-indigo-500 dark:text-sky-500 dark:border-slate-500 dark:focus:ring-sky-500 mr-2.5"
                    />
                    <span className={`${textColor} text-sm`}>{option === 'yes' ? 'Yes, it is' : 'No / Other'}</span>
                  </label>
                ))}
              </div>

              {isWellKnownCollege === 'yes' && (
                <div className="relative">
                  <label htmlFor="collegeName" className={`block text-sm font-medium ${labelColor} mb-1.5`}>
                    Select your college:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="collegeName"
                      value={collegeSearchTerm}
                      onChange={(e) => {
                        setCollegeSearchTerm(e.target.value);
                        if (finalSelectedCollege !== e.target.value) setFinalSelectedCollege('');
                        setIsCollegeDropdownOpen(true);
                      }}
                      onFocus={() => setIsCollegeDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsCollegeDropdownOpen(false), 200)} // Delay to allow click on dropdown
                      placeholder="Search or select college..."
                      className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors text-base pr-10`}
                    />
                    <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} transition-transform ${isCollegeDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isCollegeDropdownOpen && (
                    <ul className={`absolute z-10 w-full mt-1 ${dropdownBg} border ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'} rounded-md shadow-lg max-h-60 overflow-auto text-sm`}>
                      {filteredColleges.length > 0 ? filteredColleges.map(college => (
                        <li
                          key={college}
                          onMouseDown={() => { // Use onMouseDown to fire before onBlur
                            setFinalSelectedCollege(college);
                            setCollegeSearchTerm(college);
                            setIsCollegeDropdownOpen(false);
                          }}
                          className={`p-3 cursor-pointer ${textColor} ${dropdownItemHoverBg} transition-colors`}
                        >
                          {college}
                        </li>
                      )) : (
                        <li className={`p-3 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>No matches found</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Exam Preparation Questions */}
          {canAskExamQuestion && (
             <div className={`p-4 rounded-md space-y-4 ${subSectionBg} border ${subSectionBorder}`}>
                <div>
                    <p className={`block text-sm font-medium ${labelColor} mb-2`}>
                        Are you preparing for any major exams (e.g., final exams, entrance tests)?
                    </p>
                    <div className="flex flex-col xs:flex-row gap-3">
                        {(['yes', 'no'] as const).map(option => (
                        <label key={option} className={`flex-1 flex items-center p-3 border ${radioBorderColor} rounded-lg cursor-pointer transition-all hover:opacity-80 ${isPreparingForExam === option ? `${radioCheckedBorderColor} ring-1 ${radioRingColor}` : ''}`}>
                            <input
                            type="radio"
                            name="isPreparingForExam"
                            value={option}
                            checked={isPreparingForExam === option}
                            onChange={() => setIsPreparingForExam(option)}
                            className="h-4 w-4 text-indigo-600 border-slate-400 focus:ring-indigo-500 dark:text-sky-500 dark:border-slate-500 dark:focus:ring-sky-500 mr-2.5"
                            />
                            <span className={`${textColor} text-sm`}>{option === 'yes' ? 'Yes' : 'No'}</span>
                        </label>
                        ))}
                    </div>
                </div>

                {isPreparingForExam === 'yes' && (
                    <div className="space-y-4 pt-2">
                        <p className={`block text-sm font-medium ${labelColor} mb-2`}>
                            Is it a general final exam for your current study level, or a specific competitive/entrance exam?
                        </p>
                         <div className="flex flex-col xs:flex-row gap-3">
                            <label className={`flex-1 flex items-center p-3 border ${radioBorderColor} rounded-lg cursor-pointer transition-all hover:opacity-80 ${examTypeCompetitive === 'no' ? `${radioCheckedBorderColor} ring-1 ${radioRingColor}` : ''}`}>
                                <input type="radio" name="examType" value="no" checked={examTypeCompetitive === 'no'} onChange={() => setExamTypeCompetitive('no')} className="h-4 w-4 text-indigo-600 border-slate-400 focus:ring-indigo-500 dark:text-sky-500 dark:border-slate-500 dark:focus:ring-sky-500 mr-2.5"/>
                                <span className={`${textColor} text-sm`}>General Final Exam</span>
                            </label>
                            <label className={`flex-1 flex items-center p-3 border ${radioBorderColor} rounded-lg cursor-pointer transition-all hover:opacity-80 ${examTypeCompetitive === 'yes' ? `${radioCheckedBorderColor} ring-1 ${radioRingColor}` : ''}`}>
                                <input type="radio" name="examType" value="yes" checked={examTypeCompetitive === 'yes'} onChange={() => setExamTypeCompetitive('yes')} className="h-4 w-4 text-indigo-600 border-slate-400 focus:ring-indigo-500 dark:text-sky-500 dark:border-slate-500 dark:focus:ring-sky-500 mr-2.5"/>
                                <span className={`${textColor} text-sm`}>Specific Competitive/Entrance Exam</span>
                            </label>
                        </div>

                        {examTypeCompetitive === 'no' && (
                             <div>
                                <label htmlFor="generalExamDescription" className={`block text-sm font-medium ${labelColor} mt-3 mb-1.5`}>
                                    Briefly describe your final exams (optional):
                                </label>
                                <input
                                type="text"
                                id="generalExamDescription"
                                value={generalExamDescription}
                                onChange={(e) => setGeneralExamDescription(e.target.value)}
                                placeholder="E.g., Annual School Finals, University Semesters"
                                className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-base`}
                                />
                            </div>
                        )}

                        {examTypeCompetitive === 'yes' && (
                            <div className="relative mt-3">
                                <label htmlFor="competitiveExam" className={`block text-sm font-medium ${labelColor} mb-1.5`}>
                                Select Competitive Exam:
                                </label>
                                <div className="relative">
                                <input
                                    type="text"
                                    id="competitiveExamSearch"
                                    value={examSearchTerm}
                                    onChange={(e) => {
                                        setExamSearchTerm(e.target.value);
                                        if (selectedCompetitiveExamKey && POPULAR_INDIAN_EXAMS.find(ex => ex.key === selectedCompetitiveExamKey)?.name !== e.target.value) {
                                            setSelectedCompetitiveExamKey(''); // Clear if typing new
                                        }
                                        setIsExamDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsExamDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setIsExamDropdownOpen(false), 200)}
                                    placeholder="Search or select exam..."
                                    className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors text-base pr-10`}
                                />
                                <ChevronDownIcon className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} transition-transform ${isExamDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                                {isExamDropdownOpen && (
                                <ul className={`absolute z-20 w-full mt-1 ${dropdownBg} border ${theme === 'light' ? 'border-slate-200' : 'border-slate-600'} rounded-md shadow-lg max-h-60 overflow-y-auto text-sm`}>
                                    {Object.keys(groupedExams).length > 0 ? Object.entries(groupedExams).map(([groupName, examsInGroup]) => (
                                    <React.Fragment key={groupName}>
                                        <li className={`px-3 py-1.5 text-xs font-semibold ${theme === 'light' ? 'text-slate-500 bg-slate-100' : 'text-slate-400 bg-slate-700/50'} sticky top-0`}>{groupName}</li>
                                        {examsInGroup.map(exam => (
                                        <li
                                            key={exam.key}
                                            onMouseDown={() => handleExamSelection(exam.key)}
                                            className={`p-3 cursor-pointer ${textColor} ${dropdownItemHoverBg} transition-colors`}
                                        >
                                            {exam.name}
                                        </li>
                                        ))}
                                    </React.Fragment>
                                    )) : (
                                    <li className={`p-3 text-center ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>No matches found</li>
                                    )}
                                </ul>
                                )}
                            </div>
                        )}
                        {examTypeCompetitive === 'yes' && selectedCompetitiveExamKey === EXAM_PREP_OTHER_KEY && (
                            <div className="mt-3">
                                <label htmlFor="otherCompetitiveExamName" className={`block text-sm font-medium ${labelColor} mb-1.5`}>
                                Please specify the exam name:
                                </label>
                                <input
                                type="text"
                                id="otherCompetitiveExamName"
                                value={otherCompetitiveExamName}
                                onChange={(e) => setOtherCompetitiveExamName(e.target.value)}
                                placeholder="E.g., Olympiad, Regional Test"
                                className={`w-full border ${inputBg} ${inputTextColor} rounded-lg p-3 focus:ring-2 focus:outline-none transition-colors duration-200 ease-in-out shadow-sm text-base`}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
          )}


          <div className="pt-3">
            <button
              type="submit"
              className={`w-full ${buttonBg} text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-base focus:outline-none focus:ring-2 ${buttonFocusRing} focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-${cardBg.split('-')[1]}`} hover:scale-[1.02] hover:-translate-y-0.5`}
            >
              Let's Get Started!
            </button>
          </div>
          <div className="pt-3">
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out flex items-center justify-center gap-2 text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${theme === 'light' ? 'focus:ring-offset-white' : `focus:ring-offset-${cardBg.split('-')[1]}`} hover:scale-[1.02] hover:-translate-y-0.5`}
            >
              Logout
            </button>
          </div>
        </form>
      </div>
       <p className={`mt-6 text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
        &copy; {new Date().getFullYear()} {APP_NAME}. Your learning journey, amplified.
      </p>
    </div>
  );
};

export default InitialSetupPage;
