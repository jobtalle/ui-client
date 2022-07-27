import React, {FC, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useHistory} from 'react-router-dom';
import {t} from 'i18next';

import {useStore} from 'shared/hooks';
import {ROUTES} from 'core/constants';
import {UnityService} from 'shared/services';
import {IconSvg, Text, TopBar, Button} from 'ui-kit';
// TODO: Refactoring
import useCollaboration, {
  useLeaveCollaborationSpace
} from 'context/Collaboration/hooks/useCollaboration';
import {useStageModeLeave} from 'hooks/api/useStageModeService';

import {Dashboard, TileForm, TopBarActions} from './components';
import * as styled from './DashboardPage.styled';
import {RemoveTileDialog} from './components/templates/Dashboard/components/RemoveTileDialog';

const DashboardPage: FC = () => {
  const {collaborationStore, sessionStore, mainStore} = useStore();
  const {dashboardManager, spaceStore} = collaborationStore;
  const {dashboard, tileDialog, tileRemoveDialog} = dashboardManager;
  const {favoriteStore} = mainStore;
  const {tileList, onDragEnd} = dashboard;

  const history = useHistory();

  const leaveCollaborationSpaceCall = useLeaveCollaborationSpace();
  const {collaborationState, collaborationDispatch} = useCollaboration();
  const stageModeLeave = useStageModeLeave(collaborationState.collaborationSpace?.id);

  useEffect(() => {
    if (spaceStore.space.id) {
      favoriteStore.setSpaceId(spaceStore.space.id);
      dashboard.fetchDashboard(spaceStore.space.id);
    }
    return () => {
      dashboard.resetModel();
    };
  }, [dashboard, spaceStore.space.id]);

  // TODO: make as reusable action in store
  const leaveCollaborationSpace = () => {
    if (collaborationState.collaborationSpace) {
      UnityService.leaveSpace(collaborationState.collaborationSpace.id);
      leaveCollaborationSpaceCall(false).then(stageModeLeave);

      if (collaborationState.stageMode) {
        collaborationDispatch({
          type: 'COLLABORATION_STAGE_MODE_ACTION_UPDATE',
          stageMode: false
        });
      }
      history.push(ROUTES.base);
    }
  };

  return (
    <styled.Container>
      {tileDialog.isOpen && <TileForm />}
      {tileRemoveDialog.isOpen && <RemoveTileDialog />}
      <TopBar
        title={spaceStore.space.name ?? ''}
        subtitle={t('dashboard.subtitle')}
        onClose={leaveCollaborationSpace}
        actions={
          <TopBarActions
            favoriteStore={favoriteStore}
            spaceId={spaceStore.space.id}
            isAdmin={spaceStore.isAdmin}
          />
        }
      >
        <Button label={t('dashboard.vibe')} variant="primary" />
        {(spaceStore.isAdmin || spaceStore.isMember) && (
          <Button label={t('dashboard.addTile')} variant="primary" onClick={tileDialog.open} />
        )}
        <Button label={t('dashboard.invitePeople')} icon="invite-user" variant="primary" />
        {!sessionStore.isGuest && spaceStore.isStakeShown && (
          <Button label={t('dashboard.stake')} variant="primary" />
        )}
      </TopBar>

      {!dashboard.dashboardIsEdited && spaceStore.isOwner && (
        <styled.AlertContainer>
          <IconSvg name="alert" size="large" isWhite />
          <styled.AlertContent>
            <Text
              text={t('titles.updateSpace')}
              size="s"
              weight="bold"
              align="left"
              transform="uppercase"
            />
            <Text text={t('messages.updateSpace')} size="s" align="left" />
          </styled.AlertContent>
        </styled.AlertContainer>
      )}
      <Dashboard
        tilesList={tileList.tileMatrix}
        onDragEnd={onDragEnd}
        canDrag={spaceStore.isAdmin || spaceStore.isMember}
      />
    </styled.Container>
  );
};

export default observer(DashboardPage);
