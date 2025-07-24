
import React from 'react';
import ExamPrepView from '../components/ExamPrepView';
import { ExamPreparationInfo, ExamActivity } from '../types';

interface ExamPrepProps {
  examPreparationInfo: ExamPreparationInfo | null;
  examActivities: ExamActivity[];
  userName: string;
}

const ExamPrep: React.FC<ExamPrepProps> = ({ examPreparationInfo, examActivities, userName }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ExamPrepView
        examInfo={examPreparationInfo}
        activities={examActivities}
        userName={userName}
      />
    </div>
  );
};

export default ExamPrep;
