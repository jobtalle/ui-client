import React, {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {toast} from 'react-toastify';
import {useTheme} from 'styled-components';

import {useStore} from 'shared/hooks';
import {ToastMessage} from 'ui-kit';
import {Widgets} from 'scenes/widgets';

import {Meeting} from './meeting';

const AppLayers: FC = ({children}) => {
  const {unityStore} = useStore().mainStore;

  const theme = useTheme();

  if (!unityStore.isTeleportReady) {
    return <></>;
  }

  return (
    <div data-testid="AppLayers-test">
      <ToastMessage position={toast.POSITION.BOTTOM_RIGHT} theme={theme} />
      <main id="main">
        <div className="main-content">{children}</div>
        <Meeting />
      </main>
      <Widgets />
    </div>
  );
};

export default observer(AppLayers);
