import {observer} from 'mobx-react-lite';
import {FC} from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';

import {ROUTES} from 'core/constants';
import {useStore} from 'shared/hooks';
import logo from 'static/images/momentum.svg';
import {Steps} from 'ui-kit';

import * as styled from './StartPage.styled';

const StartPage: FC = () => {
  const {sessionStore} = useStore();

  const {t} = useTranslation();
  const history = useHistory();

  return (
    <styled.Container>
      <styled.Spacer />
      <styled.Information>
        <styled.LogoContainer>
          <styled.Logo src={logo} />
          <styled.Title label={t('titles.worldBuilder')} transform="uppercase" type="h1" />
        </styled.LogoContainer>
        <styled.Description text={t('messages.worldBuilderDescription')} size="xxl" />
      </styled.Information>
      <styled.ButtonAndSteps>
        {sessionStore.isSessionExists ? (
          <styled.StyledButton label={t('actions.getStarted')} size="large" />
        ) : (
          <styled.StyledButton
            label={t('actions.logIn')}
            onClick={() => history.push(ROUTES.login, {from: ROUTES.worldBuilder.start})}
            size="large"
          />
        )}
        <Steps steps={[t('titles.name'), t('titles.template'), t('titles.generate')]} />
      </styled.ButtonAndSteps>
    </styled.Container>
  );
};

export default observer(StartPage);