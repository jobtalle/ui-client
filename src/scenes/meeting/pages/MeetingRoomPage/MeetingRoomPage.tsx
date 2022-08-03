import {Transition} from '@headlessui/react';
import React, {useEffect, useMemo} from 'react';
import {toast} from 'react-toastify';
import {useHistory} from 'react-router-dom';
import {observer} from 'mobx-react-lite';
import {t} from 'i18next';

import {ToastContent, TOAST_GROUND_OPTIONS, SvgButton, Text} from 'ui-kit';
import {useStore, usePosBusEvent} from 'shared/hooks';
import {ParticipantRole} from 'core/enums';
import {StageModePIPWidget} from 'scenes/widgets/pages';
import {ROUTES} from 'core/constants';
import {appVariables} from 'api/constants';
import {AgoraRemoteUserInterface, StageModeUserInterface} from 'core/models';

import {RemoteParticipant, LocalParticipant} from './components';
import * as styled from './MeetingRoomPage.styled';

const MeetingRoomPage = () => {
  const {mainStore, meetingStore, collaborationStore, sessionStore} = useStore();
  const {meetingRoomStore} = meetingStore;
  const {space, stageModeStore} = collaborationStore;
  const {unityStore, agoraStore} = mainStore;
  const {userDevicesStore, agoraStageModeStore} = agoraStore;
  const {removeAllPopups} = stageModeStore;

  const history = useHistory();

  const stageModeAudience = useMemo(() => {
    return agoraStore.isStageMode
      ? agoraStageModeStore.users.filter((user) => {
          return user.role === ParticipantRole.AUDIENCE_MEMBER && user.uid !== sessionStore.userId;
        })
      : [];
  }, [agoraStageModeStore.users, sessionStore.userId, agoraStore.isStageMode]);

  const numberOfPeople = useMemo(() => {
    return agoraStore.isStageMode
      ? stageModeAudience.length + Number(!agoraStageModeStore.isOnStage)
      : agoraStore.remoteUsers.length + 1;
  }, [
    agoraStageModeStore.isOnStage,
    agoraStore.isStageMode,
    agoraStore.remoteUsers.length,
    stageModeAudience.length
  ]);

  useEffect(() => {
    removeAllPopups();
    if (space) {
      meetingRoomStore.setKicked(false);
      meetingRoomStore.selectParticipant(undefined);
    }
  }, [removeAllPopups, meetingRoomStore, space]);

  usePosBusEvent('meeting-mute', userDevicesStore.mute);

  usePosBusEvent('meeting-mute-all', (moderatorId) => {
    if (sessionStore.userId !== moderatorId) {
      userDevicesStore.mute();
    }
  });

  usePosBusEvent('stage-mode-mute', () => {
    userDevicesStore.mute();

    toast.info(
      <ToastContent
        headerIconName="alert"
        title={t('titles.alert')}
        text={t('messages.stageModeMuted')}
        isCloseButton
      />,
      TOAST_GROUND_OPTIONS
    );
  });

  const showMaxVideoStreamsReached = () => {
    toast.info(
      <ToastContent
        headerIconName="alert"
        title={t('titles.alert')}
        text={t('messages.maximumParticipants')}
        isCloseButton
      />,
      TOAST_GROUND_OPTIONS
    );
  };

  useEffect(() => {
    if (agoraStore.remoteUsers.length + 1 > appVariables.PARTICIPANTS_VIDEO_LIMIT) {
      showMaxVideoStreamsReached();
      meetingRoomStore.setMaxVideoShown(true);
    } else {
      meetingRoomStore.setMaxVideoShown(false);
    }
  }, [agoraStore.remoteUsers.length, meetingRoomStore]);

  const handleLeave = () => {
    history.push(ROUTES.base);
  };

  return (
    <Transition
      show={agoraStore.hasJoined}
      unmount={false}
      className="z-main-u ml-auto mr-1 "
      enter="transform transition-transform ease-out duration-300"
      enterFrom="translate-x-5 "
      enterTo="translate-x-0 "
      leave="transform transition-transform ease-in duration-300"
      leaveFrom="translate-x-0 "
      leaveTo="translate-x-5 "
    >
      <ul className="h-full mt-1">
        <styled.ListItem>
          <Transition
            show={!unityStore.isPaused}
            unmount={false}
            enter="transition-all transform ease-out duration-300"
            enterFrom="-translate-y-8 pt-0"
            enterTo="translate-y-0 pt-[30px] pb-1"
            leave="transition-all transform ease-in duration-300"
            leaveFrom="translate-y-0 pt-[30px] pb-1"
            leaveTo="-translate-y-8 pt-0 hidden"
            className="pr-.1 space-y-1 pointer-all"
            as="div"
          >
            <styled.ActionButton
              variant="primary-background"
              label={t('actions.return')}
              icon="collaboration"
              onClick={() => {
                history.push(ROUTES.collaboration);
              }}
            />
            <styled.ActionButton
              variant="danger-background"
              label={t('actions.leave')}
              icon="leave"
              onClick={handleLeave}
            />
          </Transition>
          <styled.ListItemContent className="noScrollIndicator">
            <p className="text-center whitespace-nowrap">
              {t('counts.people', {count: numberOfPeople}).toUpperCase()}
            </p>
            {!agoraStore.isStageMode && numberOfPeople > 2 && collaborationStore.isModerator && (
              <styled.MuteButtonContainer>
                <styled.MuteButton>
                  <SvgButton
                    iconName="microphoneOff"
                    size="extra-large"
                    onClick={() => {
                      meetingRoomStore.muteAllParticipants(space?.id);
                    }}
                  />
                </styled.MuteButton>
                <Text text="Mute All" transform="uppercase" size="s" />
              </styled.MuteButtonContainer>
            )}
            <ul>
              {(!agoraStore.isStageMode || !agoraStageModeStore.isOnStage) && <LocalParticipant />}
              {meetingRoomStore.maxVideoShown && (
                <li className="mb-.5 p-.5 relative rounded-full border-1 border-transparant">
                  <div
                    className="h-8 w-8 flex items-center rounded-full bg-dark-blue-100 cursor-pointer"
                    onClick={showMaxVideoStreamsReached}
                  >
                    <span className="p-.5 text-xs text-prime-blue-100 text-center flex-grow-0">
                      Video limit reached
                    </span>
                  </div>
                </li>
              )}
              {(agoraStore.isStageMode ? stageModeAudience : agoraStore.remoteUsers).map(
                (participant) => (
                  <Transition
                    key={`participant-${participant.uid as string}`}
                    appear={true}
                    enter="transition-all transform ease-out duration-300"
                    enterFrom="translate-x-8"
                    enterTo="translate-x-0 "
                    leave="transition-all transform  ease-in duration-300"
                    leaveFrom="translate-x-0 "
                    leaveTo="translate-x-8"
                  >
                    <RemoteParticipant
                      key={`participant-${participant.uid as string}`}
                      participant={
                        !agoraStore.isStageMode
                          ? (participant as AgoraRemoteUserInterface)
                          : undefined
                      }
                      audienceParticipant={
                        agoraStore.isStageMode ? (participant as StageModeUserInterface) : undefined
                      }
                      canEnterStage={agoraStageModeStore.canEnterStage}
                      totalParticipants={agoraStore.remoteUsers.length}
                    />
                  </Transition>
                )
              )}
            </ul>
          </styled.ListItemContent>
        </styled.ListItem>
      </ul>
      {!window.location.href.includes('stage-mode') && <StageModePIPWidget />}
    </Transition>
  );
};

export default observer(MeetingRoomPage);
