import {render, screen} from '@testing-library/react';
import React from 'react';

import {RESOURCE_ICONS} from '@cdo/apps/templates/teacherNavigation/lessonMaterials/ResourceIconType';
import ResourceRow from '@cdo/apps/templates/teacherNavigation/lessonMaterials/ResourceRow';

describe('ResourceRow', () => {
  const mockResourceData = {
    key: 'resourceKey1',
    name: 'Handout for teacher',
    url: 'https://wwww.code.org',
    audience: 'Teacher',
    type: 'Handout',
  };

  const renderDefault = (props = {}) => {
    return render(
      <ResourceRow unitNumber={3} resource={mockResourceData} {...props} />
    );
  };

  it('renders the resource name, position, icon, and dropdown correctly', () => {
    renderDefault();

    screen.getByText('Handout: Handout for teacher');
    screen.getByRole('link', {name: 'Handout: Handout for teacher'});

    // eslint-disable-next-line no-restricted-properties
    screen.getByTestId('resource-icon-' + RESOURCE_ICONS.LINK.icon);
    // eslint-disable-next-line no-restricted-properties
    screen.getByTestId('view-options-dropdown');
  });

  it('opens the correct URL in a new tab', () => {
    renderDefault();
    const link = screen.getByRole('link', {
      name: 'Handout: Handout for teacher',
    }) as HTMLAnchorElement;
    expect(link.href).toBe('https://wwww.code.org/');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
  });
});
