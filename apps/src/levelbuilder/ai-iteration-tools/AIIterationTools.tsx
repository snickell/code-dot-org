import React, {useEffect, useState} from 'react';
import AITutorTester from './ai-tutor/AITutorTester';
import StudentCodeDatasetMaker from './StudentCodeDatasetMaker';

interface AIIterationToolsProps {
  allowed: boolean;
}

const AIIterationTools: React.FC<AIIterationToolsProps> = ({allowed}) => {
  return (
    <div>
      <h1>AI Iteration Tools</h1>
      <p>
        A small suite of tools accessible to Levelbuilders who want to join in
        the fun of iterating on our AI tools.
      </p>
      <StudentCodeDatasetMaker />
      <AITutorTester allowed={allowed} />
    </div>
  );
};

export default AIIterationTools;
