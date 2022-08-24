import React, {FC} from 'react';
import {useHistory} from 'react-router';
import {t} from 'i18next';
import {observer} from 'mobx-react-lite';

import {PanelLayout, Text, PageTopBar} from 'ui-kit';
import {useStore} from 'shared/hooks';
import {ROUTES} from 'core/constants';

import * as styled from './SpaceAdminPage.styled';
import {
  SpaceDetailsPanel,
  TokenRuleForm,
  SpaceMembersPanel,
  SubSpacesPanel,
  TokenRulesPanel,
  TokenForm,
  ApplyTokenRuleForm
} from './components';

const SpaceAdminPage: FC = () => {
  const history = useHistory();
  const {spaceAdminStore} = useStore();
  const {spaceManagerStore} = spaceAdminStore;
  const {space, tokenRuleFormDialog, tokenFormDialog, applyTokenRuleFormDialog} = spaceManagerStore;

  const handleClose = () => {
    if (history.location.state?.canGoBack) {
      history.goBack();
    } else {
      history.push(ROUTES.base);
    }
  };

  if (!space) {
    return null;
  }

  return (
    <styled.Container data-testid="SpaceAdminPage-test">
      <PageTopBar
        title={space?.name ?? ''}
        subtitle={t('spaceAdmin.subtitle')}
        onClose={handleClose}
      />
      <styled.Body>
        {space.isAdmin ? (
          <>
            <SpaceDetailsPanel />
            <TokenRulesPanel />
            <SpaceMembersPanel />
            {space.allowedSpaceTypes.length > 0 && <SubSpacesPanel />}
          </>
        ) : (
          <styled.NoAccess>
            <PanelLayout isCustom>
              <Text isCustom text={t('spaceAdmin.noAccess')} size="l" />
            </PanelLayout>
          </styled.NoAccess>
        )}
      </styled.Body>
      {tokenRuleFormDialog.isOpen && <TokenRuleForm />}
      {tokenFormDialog.isOpen && <TokenForm />}
      {applyTokenRuleFormDialog.isOpen && <ApplyTokenRuleForm />}
    </styled.Container>
  );
};

export default observer(SpaceAdminPage);
