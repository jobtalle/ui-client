import {FC, useCallback, useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';
import {observer} from 'mobx-react-lite';
import {useTheme} from 'styled-components';
import {PluginTopBarActionInterface} from '@momentum-xyz/sdk';
import {ErrorBoundary, Text} from '@momentum-xyz/ui-kit';
import {useTranslation} from 'react-i18next';
import {toast} from 'react-toastify';

import {ROUTES} from 'core/constants';
import {useStore} from 'shared/hooks';
import {SpaceTopBar, TextChat, ToastContent} from 'ui-kit';
import {PluginLoaderModelType} from 'core/models';
import {request} from 'api/request';

import * as styled from './CollaborationPluginPage.styled';

interface PropsInterface {
  pluginLoader: PluginLoaderModelType;
}

const CollaborationPluginPage: FC<PropsInterface> = ({pluginLoader}) => {
  const {collaborationStore, mainStore, sessionStore, leaveMeetingSpace} = useStore();
  const {space, textChatStore} = collaborationStore;
  const {favoriteStore} = mainStore;
  const {plugin} = pluginLoader;

  const history = useHistory();
  const theme = useTheme();
  const [actions, setActions] = useState<PluginTopBarActionInterface>({main: () => null});
  const {t} = useTranslation();

  const renderTopBarActions = useCallback((actions: PluginTopBarActionInterface) => {
    console.info('Recieved actions', actions);
    setActions(actions);
  }, []);

  useEffect(() => {
    pluginLoader.init();

    return () => {
      pluginLoader.deinit();
    };
  }, [pluginLoader]);

  useEffect(() => {
    if (pluginLoader.isErrorWhileLoadingDynamicScript) {
      toast.error(
        <ToastContent
          isDanger
          showCloseButton
          headerIconName="alert"
          title={t('titles.alert')}
          text={t('errors.failedToLoadDynamicScript', {url: pluginLoader.url})}
        />
      );
    }
  }, [pluginLoader.isErrorWhileLoadingDynamicScript, pluginLoader.url, t]);

  if (!space) {
    return null;
  }

  return (
    <styled.Inner>
      <SpaceTopBar
        title={space.name ?? ''}
        subtitle={pluginLoader.subtitle}
        isAdmin={space.isAdmin}
        spaceId={space?.id}
        isSpaceFavorite={favoriteStore.isFavorite(space.id)}
        toggleIsSpaceFavorite={favoriteStore.toggleFavorite}
        isChatOpen={textChatStore.textChatDialog.isOpen}
        toggleChat={textChatStore.textChatDialog.toggle}
        numberOfUnreadMessages={textChatStore.numberOfUnreadMessages}
        editSpaceHidden
        onLeave={async () => {
          await leaveMeetingSpace();
          history.push(ROUTES.base);
        }}
      >
        <actions.main />
      </SpaceTopBar>
      <styled.Container>
        {!pluginLoader.isError ? (
          plugin?.SpaceExtension ? (
            <ErrorBoundary errorMessage={t('errors.errorWhileLoadingPlugin')}>
              <plugin.SpaceExtension
                theme={theme}
                isSpaceAdmin={space.isAdmin}
                spaceId={space.id}
                request={request}
                renderTopBarActions={renderTopBarActions}
              />
            </ErrorBoundary>
          ) : (
            <Text text={t('messages.loadingPlugin')} size="l" />
          )
        ) : (
          <Text text={t('errors.errorWhileLoadingPlugin')} size="l" />
        )}
        {textChatStore.textChatDialog.isOpen && (
          <TextChat
            currentChannel={textChatStore.currentChannel}
            userId={sessionStore.userId}
            sendMessage={textChatStore.sendMessage}
            messages={textChatStore.messages}
            messageSent={textChatStore.messageSent}
          />
        )}
      </styled.Container>
    </styled.Inner>
  );
};

export default observer(CollaborationPluginPage);
