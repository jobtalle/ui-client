import React, {FC, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useHistory, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {useTranslation} from 'react-i18next';

import {ROUTES} from 'core/constants';
import {PrivateSpaceError} from 'core/errors';
import {usePosBusEvent, useStore} from 'shared/hooks';
import {TOAST_COMMON_OPTIONS, TOAST_GROUND_OPTIONS, ToastContent} from 'ui-kit';
import {StageModePIPWidget} from 'scenes/widgets/pages';

import {MeetingRoomPage} from './pages';
import * as styled from './Meeting.styled';

const Meeting: FC = () => {
  const rootStore = useStore();
  const {mainStore, sessionStore, meetingStore} = rootStore;
  const {agoraStore} = mainStore;
  const {agoraMeetingStore, userDevicesStore} = agoraStore;

  const {spaceId} = useParams<{spaceId: string}>();
  const history = useHistory();
  const {t} = useTranslation();

  useEffect(() => {
    rootStore.joinMeetingSpace(spaceId).catch((e) => {
      if (e instanceof PrivateSpaceError) {
        history.push(ROUTES.base);
        toast.error(
          <ToastContent
            isDanger
            isCloseButton
            headerIconName="alert"
            title={t('titles.alert')}
            text={t('collaboration.spaceIsPrivate')}
          />
        );
      }
    });

    return () => {
      rootStore.leaveMeetingSpace();
    };
  }, [history, rootStore, sessionStore.userId, spaceId, t]);

  usePosBusEvent('meeting-mute', () => {
    userDevicesStore.mute();
  });

  usePosBusEvent('meeting-mute-all', (moderatorId) => {
    if (sessionStore.userId !== moderatorId) {
      userDevicesStore.mute();
    }
  });

  usePosBusEvent('meeting-kick', () => {
    meetingStore.setKicked(true);
    history.push(ROUTES.base);

    toast.info(
      <ToastContent
        headerIconName="logout"
        title={t('titles.kickedFromMeeting')}
        text={t('messages.kickedFromMeeting')}
        isCloseButton
      />,
      TOAST_COMMON_OPTIONS
    );
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

  useEffect(() => {
    if (agoraMeetingStore.maxVideoStreamsReached) {
      toast.info(
        <ToastContent
          headerIconName="alert"
          title={t('titles.alert')}
          text={t('messages.maximumParticipants')}
          isCloseButton
        />,
        TOAST_GROUND_OPTIONS
      );
    }
  }, [agoraMeetingStore.maxVideoStreamsReached, t]);

  return (
    <styled.Container>
      <MeetingRoomPage />
      {!history.location.pathname.includes('stage-mode') && <StageModePIPWidget />}
    </styled.Container>
  );
};

export default observer(Meeting);