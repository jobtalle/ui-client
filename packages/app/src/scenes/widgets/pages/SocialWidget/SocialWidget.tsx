import {Heading, IconSvg, Portal, SvgButton} from '@momentum-xyz/ui-kit';
import {observer} from 'mobx-react-lite';
import {FC, useCallback, useEffect, useMemo, useState} from 'react';

import {useStore} from 'shared/hooks';

import {SocialTabBar, TextChatPanel, VoiceChatPanel} from './components';
import * as styled from './SocialWidget.styled';

interface SocialPanelTabInterface {
  name: string;
  main: () => JSX.Element | null;
}

const SocialWidget: FC = () => {
  const {widgetsStore, agoraStore, sessionStore, mainStore} = useStore();
  const {worldStore} = mainStore;
  const {socialStore} = widgetsStore;
  const {streamChatStore} = socialStore;

  const tabs: SocialPanelTabInterface[] = useMemo(
    () => [
      {
        name: 'Chat',
        main: () => <TextChatPanel />
      },
      {
        name: 'Voice',
        main: () => <VoiceChatPanel />
      }
    ],
    []
  );

  useEffect(() => {
    streamChatStore.init(sessionStore.userId, worldStore.worldId, sessionStore.user ?? undefined);

    return () => {
      streamChatStore.deinit(worldStore.worldId);
    };
  }, [sessionStore.user, sessionStore.userId, streamChatStore, worldStore.worldId]);

  const [selectedTabIndex, setSelectedTabIndex] = useState(1);

  const selectedTab = tabs[selectedTabIndex];

  const handleClose = useCallback(async () => {
    if (agoraStore.hasJoined) {
      await agoraStore.leaveVoiceChat();
    }

    socialStore.widget.close();
  }, [agoraStore, socialStore.widget]);

  return (
    <Portal>
      <styled.Modal>
        <styled.Container>
          <styled.Header>
            <styled.HeaderItemsGroup>
              <IconSvg name="collaboration" size="large" />
              <Heading label="Social" transform="uppercase" type="h2" />
            </styled.HeaderItemsGroup>
            <styled.HeaderItemsGroup>
              <SvgButton iconName="close" size="small" onClick={handleClose} />
            </styled.HeaderItemsGroup>
          </styled.Header>
          <styled.TabsSelector>
            <SocialTabBar
              selectedTabIndex={selectedTabIndex}
              tabs={tabs}
              onSelect={setSelectedTabIndex}
            />
          </styled.TabsSelector>
          <styled.Body>
            <selectedTab.main />
          </styled.Body>
        </styled.Container>
      </styled.Modal>
    </Portal>
  );
};

export default observer(SocialWidget);
