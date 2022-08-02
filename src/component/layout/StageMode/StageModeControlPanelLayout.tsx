import React, {useCallback, useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {t} from 'i18next';
import {observer, useObserver} from 'mobx-react-lite';

import {ToastContent, Toggle, Stage} from 'ui-kit';
import {useStore} from 'shared/hooks';
import {ParticipantRole} from 'core/enums';
import {AgoraRemoteUserInterface} from 'stores/MainStore/models/AgoraStore/models';
import {appVariables} from 'api/constants';

import Page from '../../molucules/Page';
import {useConfirmationDialog} from '../../../hooks/useConformationDialog';
import {bytesToUuid} from '../../../core/utils/uuid.utils';
import {useUser} from '../../../hooks/api/useUser';
import Button from '../../atoms/Button';

import StageModePopupQueueComponent from './StageModePopupQueueComponent';

const StageModeControlPanelLayout: React.FC = () => {
  const [stageStats, setStageStats] = useState<{speakers: number; audience: number}>({
    speakers: 0,
    audience: 0
  });
  const {mainStore, collaborationStore, sessionStore} = useStore();
  const {agoraStore} = mainStore;
  const {stageModeStore, userDevicesStore} = agoraStore;
  const {space} = collaborationStore;

  const [selectedRemoteUserIdForRemove, setSelectedRemoteUserIdForRemove] = useState<string | null>(
    null
  );
  const [user] = useUser(selectedRemoteUserIdForRemove as string);
  const [userToggledStageOn, setUserToggledStageOn] = useState<boolean>(false);

  const {getConfirmation} = useConfirmationDialog();

  const confirmRemoveUserFromStage = useCallback(() => {
    getConfirmation({
      blockInterface: true,
      title: 'Remove participant from stage',
      message: `Are you sure you want remove this ${user?.name as string} from stage`,
      confirmButton: 'Yes, remove from stage',
      cancelButton: 'No, cancel'
    }).then(async (result) => {
      if (result) {
        if (user?.id.data) {
          try {
            await stageModeStore.kickUserOffStage(bytesToUuid(user.id.data));
            setSelectedRemoteUserIdForRemove(null);
          } catch {
            setSelectedRemoteUserIdForRemove(null);
            toast.error(
              <ToastContent
                isDanger
                headerIconName="alert"
                title={t('titles.alert')}
                text={t('messages.offStageFailure', {
                  user: user.name
                })}
                isCloseButton
              />
            );
          }
        }
      } else {
        setSelectedRemoteUserIdForRemove(null);
      }
    });
  }, [getConfirmation, stageModeStore, user]);

  const remoteUserClicked = useCallback(
    async (remoteUser: AgoraRemoteUserInterface, event = 'remove') => {
      if (event === 'remove') {
        setSelectedRemoteUserIdForRemove(remoteUser.uid as string);
      } else if (event === 'mute') {
        await agoraStore.muteRemoteUser(remoteUser.uid as string);
      }
    },
    [agoraStore]
  );

  useEffect(() => {
    if (selectedRemoteUserIdForRemove && user) {
      //display remove from stage confirmation when use data is collected
      confirmRemoveUserFromStage();
    }
  }, [user, selectedRemoteUserIdForRemove, confirmRemoveUserFromStage]);

  const handleEnterStage = useCallback(() => {
    if (!stageModeStore.canEnterStage) {
      toast.error(`The stage is full`);
      return;
    }

    stageModeStore.enterStage(userDevicesStore.createLocalTracks);
  }, [stageModeStore, userDevicesStore]);

  useEffect(() => {
    if (stageModeStore.joined && userToggledStageOn) {
      setUserToggledStageOn(false);
      handleEnterStage();
    }
  }, [handleEnterStage, stageModeStore.joined, userToggledStageOn]);

  const handleLeaveStage = useCallback(() => {
    console.info('[stagemode] LEAVE STAGE');
    stageModeStore.leaveStage();
  }, [stageModeStore]);

  const stageModeOffMessage = () => (
    <div className="flex flex-grow z-0">
      <div className="flex-grow" />
      <p className="text-xl uppercase text-white-50 self-center text-center font-bold">
        Stage Mode has not Been Toggled <br />
        <br />
        You can toggle stage-mode, since you are a member of this space
      </p>
      <div className="flex-grow" />
    </div>
  );

  const usersOnStage = () => (
    <div className="flex flex-grow z-0">
      <div className="flex-grow" />
      <Stage onRemoteUserClick={remoteUserClicked} />
      <div className="flex-grow" />
    </div>
  );

  useEffect(() => {
    const audience = stageModeStore.users.filter((user) => {
      return user.role === ParticipantRole.AUDIENCE_MEMBER;
    });

    setStageStats({
      speakers: agoraStore.remoteUsers.length + (stageModeStore.isOnStage ? 1 : 0),
      audience: stageModeStore.isOnStage ? audience.length - 1 : audience.length
    });
  }, [stageModeStore.users, stageModeStore.isOnStage, agoraStore.remoteUsers]);

  const actions = useObserver(() => {
    return (
      <div className="flex items-center justify-between mx-4 gap-2 flex-grow">
        <div className="flex items-center gap-1">
          <Toggle
            checked={agoraStore.isStageMode}
            onChange={() => {
              agoraStore.toggleStageMode(sessionStore.userId);
            }}
            disabled={agoraStore.isTogglingStageMode}
          />
          <span className="text-sm">
            {agoraStore.isStageMode ? 'Stage is active' : 'Stage is inactive. Toggle to activate.'}
          </span>
        </div>
        {agoraStore.isStageMode && (stageModeStore.canEnterStage || stageModeStore.isOnStage) && (
          <>
            <div className="flex items-center gap-1">
              <span>
                Speakers: {stageStats.speakers}/{appVariables.MAX_STAGE_USERS}
              </span>
              <span>Audience: {stageStats.audience}</span>
            </div>
            <Button
              type={stageModeStore.isOnStage ? 'ghost-red' : 'ghost'}
              onClick={stageModeStore.isOnStage ? handleLeaveStage : handleEnterStage}
            >
              {stageModeStore.isOnStage ? 'Leave Stage?' : 'Go on Stage?'}
            </Button>
          </>
        )}
        {agoraStore.isStageMode && !stageModeStore.canEnterStage && <span>Stage is full</span>}
      </div>
    );
  });

  if (!space) {
    return null;
  }

  return (
    <Page title={space.name || ''} subtitle="Stage Mode" collaboration actions={actions}>
      <div className="flex w-full">
        <div className="flex flex-col space-y-1">
          <StageModePopupQueueComponent />
        </div>
        {agoraStore.isStageMode ? usersOnStage() : stageModeOffMessage()}
      </div>
    </Page>
  );
};

export default observer(StageModeControlPanelLayout);
