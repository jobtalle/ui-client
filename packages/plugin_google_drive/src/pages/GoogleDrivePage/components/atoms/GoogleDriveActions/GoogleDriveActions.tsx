import React, {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {useTranslation} from 'react-i18next';
import {Button, PropsWithThemeInterface} from '@momentum-xyz/ui-kit';
import {GoogleDocumentInterface} from 'core/interfaces';

import * as styled from './GoogleDriveActions.styled';

interface PropsInterface extends PropsWithThemeInterface {
  spaceId?: string;
  isAdmin: boolean;
  googleDocument: GoogleDocumentInterface | null;
  pickDocument: () => void;
  closeDocument: () => void;
}

const GoogleDriveActions: FC<PropsInterface> = ({
  theme,
  spaceId,
  isAdmin,
  googleDocument,
  closeDocument,
  pickDocument
}) => {
  const {t} = useTranslation();

  if (!isAdmin || !googleDocument?.url || !spaceId) {
    return null;
  }

  return (
    <styled.Container theme={theme}>
      <Button label={t('actions.changeDocument')} variant="primary" onClick={pickDocument} />
      <Button label={t('actions.close')} variant="danger" onClick={closeDocument} />
    </styled.Container>
  );
};

export default observer(GoogleDriveActions);