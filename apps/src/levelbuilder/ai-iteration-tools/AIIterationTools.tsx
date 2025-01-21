import React from 'react';

import AITutorTester from './ai-tutor/AITutorTester';
import StudentCodeDatasetMaker from './StudentCodeDatasetMaker';

interface AIIterationToolsProps {
  canUseAITutor: boolean;
  canMakeDatasets: boolean;
}

const AIIterationTools: React.FC<AIIterationToolsProps> = ({
  canMakeDatasets,
  canUseAITutor,
}) => {
  return (
    <div>
      <h1>AI Iteration Tools</h1>
      <p>
        A small suite of tools accessible to Levelbuilders who want to join in
        the fun of iterating on our AI tools.
      </p>
      <StudentCodeDatasetMaker allowed={canMakeDatasets} />
      <br />
      <hr />
      <br />
      <AITutorTester allowed={canUseAITutor} />
    </div>
  );
};

export default AIIterationTools;
