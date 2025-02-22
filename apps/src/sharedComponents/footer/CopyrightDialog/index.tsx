import React from 'react';

import Link from '@cdo/apps/componentLibrary/link';
import {BodyThreeText, Heading3} from '@cdo/apps/componentLibrary/typography';
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import i18n from '@cdo/locale';

import './style.scss';
import defaultStyle from '@cdo/apps/sharedComponents/accessible-dialogue.module.scss';

// External code can specify additional content to be shown, or clear it again.
// Currently used by Music Lab to show image attributions.
let extraCopyrightContent: React.ReactNode | undefined = undefined;
export const setExtraCopyrightContent = (content?: React.ReactNode) => {
  extraCopyrightContent = content;
};

export interface CopyrightDialogProps {
  isOpen: boolean;
  closeModal: (e: React.ChangeEvent) => void;
}

const CopyrightDialog: React.FC<CopyrightDialogProps> = ({
  isOpen,
  closeModal,
}) => {
  return isOpen ? (
    <AccessibleDialog
      styles={{xCloseButton: defaultStyle.xCloseButton + ' no-mc'}}
      id="copyright-modal"
      className="copyrightDialog"
      onClose={closeModal}
      closeOnClickBackdrop={true}
    >
      <div>
        <div>
          <Heading3>{i18n.copyright()}</Heading3>
        </div>
        <hr aria-hidden="true" />
        <div className="modalBody">
          <SafeMarkdown
            markdown={i18n.copyright_thanks({
              donors_link: pegasus('/about/donors'),
              partners_link: pegasus('/about/partners'),
              team_link: pegasus('/about/team'),
            })}
          />
          <BodyThreeText>{i18n.copyright_specialRecognition()}</BodyThreeText>
          <SafeMarkdown
            markdown={i18n.copyright_artFrom({
              current_year: new Date().getFullYear(),
            })}
          />
          <SafeMarkdown
            markdown={i18n.copyright_codeLicense({
              gnu_license_link:
                'https://www.gnu.org/licenses/old-licenses/lgpl-2.1-standalone.html',
            })}
          />
          {extraCopyrightContent && (
            <div className="extraCopyrightContent">{extraCopyrightContent}</div>
          )}
          <BodyThreeText>{i18n.copyright_builtOnGithub()}</BodyThreeText>
          <Link
            href="https://aws.amazon.com/what-is-cloud-computing"
            className="awsLogoContainer"
          >
            <img
              src="/shared/images/Powered-By_logo-horiz_RGB.png"
              alt="Powered by AWS Cloud Computing"
              className="awsLogo"
            />
          </Link>
          <SafeMarkdown
            markdown={i18n.copyright_trademark({
              current_year: new Date().getFullYear(),
              cs_discoveries: 'CS Discoveries&reg;',
            })}
          />
        </div>
        <hr aria-hidden="true" />
      </div>
    </AccessibleDialog>
  ) : null;
};

export default CopyrightDialog;
