import {observer} from 'mobx-react-lite';
import {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';

import {ROUTES} from 'core/constants';
import {useStore} from 'shared/hooks';
import {WorldBuilderFooter, WorldBuilderHeader} from 'scenes/worldBuilder/components';
import {Page} from 'ui-kit';
import background from 'static/images/worldBuilder.png';

import * as styled from './WorldBuilderStartPage.styled';

const WorldBuilderStartPage: FC = () => {
  const {sessionStore} = useStore();

  const {t} = useTranslation();
  const history = useHistory();

  return (
    <Page backgroundSrc={background} showSimpleProfileMenu={sessionStore.isSessionExists}>
      <styled.Container>
        <styled.Spacer />
        <styled.Information>
          <WorldBuilderHeader />
          <styled.Description text={t('messages.worldBuilderDescription')} size="xxl" />
        </styled.Information>
        <WorldBuilderFooter
          buttonLabel={sessionStore.isSessionExists ? t('actions.getStarted') : t('actions.logIn')}
          onNext={() => {
            if (sessionStore.isSessionExists) {
              history.push(ROUTES.worldBuilder.name);
            } else {
              history.push(ROUTES.login, {from: ROUTES.worldBuilder.start});
            }
          }}
        />
      </styled.Container>
    </Page>
  );
};

export default observer(WorldBuilderStartPage);