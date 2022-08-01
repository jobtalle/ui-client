import React from 'react';
import {useTranslation} from 'react-i18next';
import {observer} from 'mobx-react-lite';

import {appVariables} from 'api/constants';
import {useStore} from 'shared/hooks';

import * as styled from './StageModeStats.styled';

const StageModeStats: React.FC = () => {
  const {t} = useTranslation();
  const {agoraStore} = useStore().mainStore;
  const {stageModeStore} = agoraStore;

  return (
    <styled.Container>
      <span>
        {t('labels.speakers')}: {stageModeStore.numberOfSpeakers}/{appVariables.MAX_STAGE_USERS}
      </span>
      <span>
        {t('labels.audience')}: {stageModeStore.numberOfAudienceMembers}
      </span>
    </styled.Container>
  );
};

export default observer(StageModeStats);
