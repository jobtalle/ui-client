import React from 'react';
import {useTranslation} from 'react-i18next';

import {StageModePopupInfoInterface} from 'core/interfaces';
import {useStore} from 'shared/hooks';
import {StageModePopupTypeEnum} from 'core/enums';
import {Button, PanelLayout, Text} from 'ui-kit';

import * as styled from './StageModePopup.styled';

export interface StageModePopupPropsInterface {
  info: StageModePopupInfoInterface;
  canEnterStage: boolean;
}

const StageModePopup: React.FC<StageModePopupPropsInterface> = ({info, canEnterStage}) => {
  const {collaborationStore} = useStore();
  const {stageModeStore} = collaborationStore;
  const {removeRequestPopup, removeAwaitingPermissionPopup} = stageModeStore;

  const {t} = useTranslation();

  const handleAccept = (info: StageModePopupInfoInterface) => {
    info
      ?.onAccept?.()
      .then((shouldClose) => shouldClose && info.userId && removeRequestPopup(info.userId));
  };

  const handleDecline = (info: StageModePopupInfoInterface) => {
    info
      ?.onDecline?.()
      .then((shouldClose) => shouldClose && info.userId && removeRequestPopup(info.userId));
  };

  switch (info.type) {
    case StageModePopupTypeEnum.AWAITING_PERMISSION:
      return (
        <PanelLayout componentSize={{width: '242px'}}>
          <styled.PermissionBody onClick={removeAwaitingPermissionPopup}>
            <Text text={t('messages.requestedPermissionToGoOnStage')} size="m" align="left" />
            <Text text={t('messages.waitForModeratorsToAccept')} size="xs" align="left" />
          </styled.PermissionBody>
        </PanelLayout>
      );
    case StageModePopupTypeEnum.RECEIVED_PERMISSION_REQUEST:
      return (
        <PanelLayout
          title={t('titles.userWantsToComeOnStage', {user: info.userName})}
          componentSize={{width: '242px'}}
        >
          <styled.RequestBody>
            <Text text={t('messages.thisPersonWantsToComeOnStage')} size="m" align="left" />
            <Text
              text={
                canEnterStage
                  ? t('messages.thisWillEnablePersonToUseStage')
                  : t('messages.stageIsCurrentlyFull')
              }
              size="xs"
              align="left"
            />
            <styled.RequestActions>
              <Button
                label={t('actions.accept')}
                variant="primary"
                disabled={!canEnterStage}
                size="small"
                onClick={() => handleAccept(info)}
              />

              <Button
                label={t('actions.decline')}
                variant="danger"
                onClick={() => handleDecline(info)}
              />
            </styled.RequestActions>
          </styled.RequestBody>
        </PanelLayout>
      );
  }
};

export default StageModePopup;
