import React, {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {useAuth} from 'react-oidc-context';
import {useTheme} from 'styled-components';
import Unity from 'react-unity-webgl';

import {useStore} from 'shared/hooks';
import {UnityService} from 'shared/services';
import {Portal, UnityLoader} from 'ui-kit';

// TODO: Refactoring
import useUnityEvent from '../../../../context/Unity/hooks/useUnityEvent';

import * as styled from './UnityPage.styled';

const UnityContextCSS = {
  width: '100vw',
  height: '100vh'
};

const UnityPage: FC = () => {
  const {mainStore, unityLoaded} = useStore();
  const {unityStore} = mainStore;

  const theme = useTheme();
  const auth = useAuth();

  useUnityEvent('MomentumLoaded', () => {
    UnityService.setAuthToken(auth.user?.access_token);
  });

  useUnityEvent('TeleportReady', () => {
    const worldId = UnityService.getCurrentWorld?.();
    if (worldId) {
      unityLoaded(worldId);
    }
  });

  useUnityEvent('Error', (message: string) => {
    console.info('Unity Error handling', message);
  });

  // TODO: Make route path + page
  useUnityEvent('ExterminateUnity', () => {
    window.location.href = '/disconnect.html';
  });

  if (!unityStore.unityContext) {
    return <></>;
  }

  return (
    <Portal>
      <styled.Inner>
        <Unity unityContext={unityStore.unityContext} style={UnityContextCSS} />
      </styled.Inner>
      {!unityStore.isTeleportReady && <UnityLoader theme={theme} />}
    </Portal>
  );
};

export default observer(UnityPage);
