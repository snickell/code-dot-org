import React from 'react';
import JoinSection from './JoinSection';

export default storybook => {
  return storybook
    .storiesOf('JoinSection', module)
    .addStoryTable([
      {
        name: 'Join Section - no sections yet',
        description: 'Input field for students to enter a section code to join a section. Has a dashed border to draw attention if the student is not yet a member of a section',
        story: () => (
          <JoinSection
            enrolledInASection={false}
            updateSections={storybook.action('updateSections')}
            updateSectionsResult={storybook.action('updateSectionsResult')}
          />
        )
      },
      {
        name: 'Join Section - student already enrolled in at least one section',
        description: 'Input field for students to enter a section code to join a section. Has a plain border',
        story: () => (
          <JoinSection
            enrolledInASection={true}
            updateSections={storybook.action('updateSections')}
            updateSectionsResult={storybook.action('updateSectionsResult')}
          />
        )
      }
    ]);
};
