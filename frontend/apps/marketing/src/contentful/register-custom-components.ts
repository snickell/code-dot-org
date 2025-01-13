/**
 * This file is used to register custom react components for usage in Contentful Studio Experiences.
 *
 * Note: This file must be imported both server-side and client-side to ensure Contentful is able to map on both rendering modes.
 */
import {defineComponents} from '@contentful/experiences-sdk-react';

import {Stub, StubContentfulComponentDefinition} from '@code-dot-org/dsco/stub';
import {
  StubSection,
  StubSectionContentfulComponentDefinition,
} from '@code-dot-org/dsco/stub-section';
import {
  Divider,
  DividerContentfulComponentDefinition,
} from '@code-dot-org/dsco/divider';

defineComponents([
  {
    component: Stub,
    definition: StubContentfulComponentDefinition,
  },
  {
    component: StubSection,
    definition: StubSectionContentfulComponentDefinition,
  },
  {
    component: Divider,
    definition: DividerContentfulComponentDefinition,
  },
]);
