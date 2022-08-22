import React, {FC, useCallback} from 'react';
import {observer} from 'mobx-react-lite';
import {generatePath, useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import cn from 'classnames';

import {Button} from 'ui-kit';
import {useStore} from 'shared/hooks';
import {ROUTES} from 'core/constants';

import {ExplorePanel, OnlineUsersPanel} from './components';
import * as styled from './HomePage.styled';

interface PropsInterface {
  isTable?: boolean;
  isFlight?: boolean;
}

const HomePage: FC<PropsInterface> = ({isFlight, isTable}) => {
  const {collaborationStore, meetingStore, mainStore} = useStore();
  const {leftMeetingSpaceId} = collaborationStore;
  const {unityStore} = mainStore;

  const {t} = useTranslation();
  const history = useHistory();

  const rejoinMeeting = useCallback(
    (spaceId) => {
      unityStore.teleportToSpace(spaceId);
      history.push(generatePath(ROUTES.collaboration.dashboard, {spaceId}));
    },
    [unityStore, history]
  );

  return (
    <styled.Container
      data-testid="HomePage-test"
      className={cn((isFlight || isTable) && 'hasJoined')}
    >
      <styled.PanelWrapper>
        <ExplorePanel />
      </styled.PanelWrapper>

      <styled.PanelWrapper>
        {!isFlight && leftMeetingSpaceId && !meetingStore.isKicked && (
          <styled.Rejoin>
            <Button
              variant="primary"
              label={t('actions.rejoinMeeting')}
              onClick={() => rejoinMeeting(leftMeetingSpaceId)}
            />
          </styled.Rejoin>
        )}

        <OnlineUsersPanel />
      </styled.PanelWrapper>
    </styled.Container>
  );
};

export default observer(HomePage);
