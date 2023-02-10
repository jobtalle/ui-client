import React, {FC, useEffect, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {useTheme} from 'styled-components';
import {generatePath, matchPath, useHistory, useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';
import Unity from 'react-unity-webgl';
import {Portal} from '@momentum-xyz/ui-kit';

import {PRIVATE_ROUTES_WITH_UNITY} from 'scenes/App.routes';
import {appVariables} from 'api/constants';
import {ROUTES} from 'core/constants';
import {useStore, usePosBusEvent, useUnityEvent} from 'shared/hooks';
import {
  UnityLoader,
  ToastContent,
  HighFiveContent,
  TOAST_BASE_OPTIONS,
  TOAST_COMMON_OPTIONS,
  TOAST_NOT_AUTO_CLOSE_OPTIONS
} from 'ui-kit';

import * as styled from './UnityPage.styled';

const UnityContextCSS = {
  width: '100vw',
  height: '100vh'
};

const UnityPage: FC = () => {
  const {unityStore, sessionStore, nftStore, widgetsStore} = useStore();
  const {unityInstanceStore} = unityStore;

  const theme = useTheme();
  const history = useHistory();
  const {t} = useTranslation();
  const location = useLocation();

  useEffect(() => {
    unityInstanceStore.init();
  }, [unityInstanceStore]);

  // TODO: FIXME
  const worldId = useMemo(() => {
    const paths: string[] = PRIVATE_ROUTES_WITH_UNITY.map((route) => route.path);

    let worldId = '';
    paths.forEach((path) => {
      const match = matchPath<{worldId: string}>(location.pathname, {path: path});
      if (match?.params?.worldId) {
        worldId = match.params.worldId;
      }
    });

    return worldId;
  }, [location.pathname]);

  useUnityEvent('MomentumLoaded', async () => {
    console.log(`Unity worldId: ${worldId}`);

    if (worldId) {
      await unityInstanceStore.loadWorldById(worldId, sessionStore.token);
    } else {
      console.error(`There is no worldId in route.`);
    }
  });

  useUnityEvent('TeleportReady', () => {
    const worldId = unityInstanceStore.getCurrentWorld();
    if (worldId) {
      unityStore.initTeleport(worldId);
    }
  });

  useUnityEvent('Error', (message: string) => {
    console.info('Unity Error handling', message);
  });

  useUnityEvent('ExterminateUnity', () => {
    document.location.href = ROUTES.system.disconnected;
  });

  useUnityEvent('ClickObjectEvent', (spaceId: string, label: string) => {
    if (label === 'portal_odyssey') {
      const nft = nftStore.getNftByUuid(appVariables.ODYSSEY_WORLD_ID);
      if (nft) {
        widgetsStore.odysseyInfoStore.open(nft);
        return;
      }
    }
    history.push({
      pathname: generatePath(ROUTES.odyssey.object.root, {
        worldId: unityStore.worldId,
        objectId: spaceId
      })
    });
  });

  useUnityEvent('EditObjectEvent', (spaceId: string) => {
    console.log('EditObjectEvent', spaceId);
    history.push(generatePath(ROUTES.odyssey.creator.base, {worldId: unityStore.worldId}));
    setTimeout(() => {
      // This even comes faster than actual click, so delay
      unityInstanceStore.onUnityObjectClick(spaceId);
    }, 500);
  });

  useUnityEvent('ProfileClickEvent', (id: string) => {
    const nft = nftStore.getNftByUuid(id);
    if (nft) {
      widgetsStore.odysseyInfoStore.open(nft);
    }
  });

  usePosBusEvent('fly-to-me', (spaceId, userId, userName) => {
    if (sessionStore.userId === userId) {
      toast.info(
        <ToastContent
          headerIconName="fly-with-me"
          title="Fly to me Request"
          text="Your request was sent!"
          showCloseButton
        />,
        TOAST_COMMON_OPTIONS
      );
    } else {
      toast.info(
        <ToastContent
          headerIconName="fly-with-me"
          title="Fly to me Request"
          text={`${userName} has invited you to fly to them`}
          declineInfo={{title: t('actions.decline')}}
          approveInfo={{
            title: t('actions.join'),
            onClick: () => unityInstanceStore.teleportToUser(userId)
          }}
        />,
        TOAST_NOT_AUTO_CLOSE_OPTIONS
      );
    }
  });

  // FIXME: FYI: It is not used anymore
  usePosBusEvent('space-invite', async (spaceId, invitorId, invitorName, uiTypeId) => {
    console.info('[POSBUS EVENT] space-invite', spaceId, invitorId, invitorName, uiTypeId);
  });

  usePosBusEvent('high-five', (senderId, message) => {
    console.info('[POSBUS EVENT] high-five', senderId, message);
    toast.info(
      <HighFiveContent
        message={message}
        sendBack={() => {
          unityInstanceStore.sendHighFiveBack(senderId);
        }}
        showCloseButton
      />,
      TOAST_BASE_OPTIONS
    );
  });

  usePosBusEvent('high-five-sent', (message) => {
    console.info('[POSBUS EVENT] high-five-sent', message);
    toast.info(
      <ToastContent
        headerIconName="check"
        title={t('messages.highFiveSentTitle', {name: message})}
        text={t('messages.highFiveSentText')}
        showCloseButton
      />
    );
  });

  usePosBusEvent('notify-gathering-start', (message) => {
    console.info('[POSBUS EVENT] notify-gathering-start', message);

    toast.info(
      <ToastContent
        headerIconName="calendar"
        title={t('titles.joinGathering')}
        text={t('messages.joinGathering', {title: message.title})}
        approveInfo={{
          title: t('actions.dismiss')
        }}
        showCloseButton
      />,
      TOAST_NOT_AUTO_CLOSE_OPTIONS
    );
  });

  usePosBusEvent('simple-notification', (message) => {
    console.info('[POSBUS EVENT] simple-notification', message);
    toast.info(
      <ToastContent
        headerIconName="check"
        title={t('titles.alert')}
        text={message}
        showCloseButton
      />
    );
  });

  if (!unityInstanceStore.unityContext) {
    return <></>;
  }

  return (
    <Portal>
      <styled.Inner
        data-testid="UnityPage-test"
        onClick={(event) => {
          unityInstanceStore.setLastClickPosition(event.clientX, event.clientY);
        }}
      >
        <Unity unityContext={unityInstanceStore.unityContext} style={UnityContextCSS} />
      </styled.Inner>

      {!unityStore.isUnityAvailable && <UnityLoader theme={theme} />}
    </Portal>
  );
};

export default observer(UnityPage);
