import React, {FC} from 'react';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {t} from 'i18next';
import {observer} from 'mobx-react-lite';
import {toast} from 'react-toastify';

import {VideoTileFormInterface} from 'api';
import {Button, Input, TOAST_COMMON_OPTIONS, ToastContent} from 'ui-kit';
import {YOUTUBE_URL_PLACEHOLDER} from 'core/constants';
import {TileInterface} from 'core/models';

import * as styled from './VideoTileForm.styled';

interface PropsInterface {
  currentTile: TileInterface | null;
  spaceId: string;
  createTile: (spaceId: string, data: VideoTileFormInterface) => void;
  updateTile: (tileId: string, data: VideoTileFormInterface) => void;
  onClose: () => void;
  fetchDashboard: (spaceId: string) => void;
}

const VideoTileForm: FC<PropsInterface> = ({
  currentTile,
  spaceId,
  createTile,
  updateTile,
  onClose,
  fetchDashboard
}) => {
  const {
    control,
    formState: {errors},
    handleSubmit,
    reset
  } = useForm<VideoTileFormInterface>();

  const formSubmitHandler: SubmitHandler<VideoTileFormInterface> = async (
    data: VideoTileFormInterface
  ) => {
    if (!currentTile?.id) {
      const isSucceed = await createTile(spaceId, data);
      onClose();
      // @ts-ignore
      if (isSucceed) {
        await fetchDashboard(spaceId);
        toast.info(
          <ToastContent
            headerIconName="alert"
            title={t('titles.alert')}
            text={t('messages.tileCreateSuccess')}
            isCloseButton
          />,
          TOAST_COMMON_OPTIONS
        );
      } else {
        toast.error(
          <ToastContent
            headerIconName="alert"
            title={t('titles.alert')}
            text={t('messages.tileCreateError')}
            isDanger
            isCloseButton
          />,
          TOAST_COMMON_OPTIONS
        );
      }
    } else {
      const isSucceed = await updateTile(currentTile.id, data);
      onClose();
      await fetchDashboard(spaceId);
      // @ts-ignore
      if (isSucceed) {
        toast.info(
          <ToastContent
            headerIconName="alert"
            title={t('titles.alert')}
            text={t('messages.tileUpdateSuccess')}
            isCloseButton
          />,
          TOAST_COMMON_OPTIONS
        );
      } else {
        toast.error(
          <ToastContent
            headerIconName="alert"
            title={t('titles.alert')}
            text={t('messages.tileUpdateError')}
            isDanger
            isCloseButton
          />,
          TOAST_COMMON_OPTIONS
        );
      }
    }

    reset();
  };

  return (
    <styled.Item>
      <styled.TextItem>
        <Controller
          name="youtube_url"
          control={control}
          defaultValue={currentTile ? currentTile?.content?.url : ''}
          rules={{required: true}}
          render={({field: {onChange, value}}) => (
            <Input
              label={t('dashboard.tileForm.videoLabel')}
              value={value}
              onChange={onChange}
              placeholder={YOUTUBE_URL_PLACEHOLDER}
              isError={!!errors.youtube_url}
              isCustom
            />
          )}
        />
      </styled.TextItem>
      <styled.ButtonWrapper>
        <Button
          label={currentTile?.id ? 'update tile' : 'create tile'}
          onClick={handleSubmit(formSubmitHandler)}
        />
      </styled.ButtonWrapper>
    </styled.Item>
  );
};

export default observer(VideoTileForm);
