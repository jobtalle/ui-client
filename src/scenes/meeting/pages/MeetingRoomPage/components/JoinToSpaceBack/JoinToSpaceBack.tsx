import React, {FC} from 'react';
import {Transition} from '@headlessui/react';
import {useHistory} from 'react-router-dom';
import {observer} from 'mobx-react-lite';
import {t} from 'i18next';

import {ROUTES} from 'core/constants';
import {useStore} from 'shared/hooks';

import * as styled from './JoinToSpaceBack.styled';

const MeetingRoomPage: FC = () => {
  const {mainStore} = useStore();
  const {unityStore} = mainStore;

  const history = useHistory();

  return (
    <Transition
      show={!unityStore.isPaused}
      unmount={false}
      enter="transition-all transform ease-out duration-300"
      enterFrom="-translate-y-8 pt-0"
      enterTo="translate-y-0 pt-[30px] pb-1"
      leave="transition-all transform ease-in duration-300"
      leaveFrom="translate-y-0 pt-[30px] pb-1"
      leaveTo="-translate-y-8 pt-0 hidden"
      className="pr-.1 space-y-1 pointer-all"
      as="div"
    >
      <styled.ActionButton
        variant="primary-background"
        label={t('actions.return')}
        icon="collaboration"
        onClick={() => {
          history.push(ROUTES.collaboration);
        }}
      />
      <styled.ActionButton
        variant="danger-background"
        label={t('actions.leave')}
        icon="leave"
        onClick={() => {
          history.push(ROUTES.base);
        }}
      />
    </Transition>
  );
};

export default observer(MeetingRoomPage);
