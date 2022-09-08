import React, {FC, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useTheme} from 'styled-components';
import {t} from 'i18next';
import {SubmitHandler, Controller, useForm} from 'react-hook-form';
import DatePicker from 'react-datepicker';
import cn from 'classnames';

import {useStore} from 'shared/hooks';
import {Input, Dialog, TextArea} from 'ui-kit';
import {DATE_TIME_FORMAT} from 'core/constants';
import {EventFormInterface} from 'api';
import {timeFromNow} from 'core/utils';
import {appVariables} from 'api/constants';

import * as styled from './EventForm.styled';

const EventForm: FC = () => {
  const theme = useTheme();
  const {calendarStore, space} = useStore().collaborationStore;
  const {eventForm, formDialog, eventList} = calendarStore;
  const {eventFormRequest, currentEvent} = eventForm;

  const {
    control,
    formState: {errors},
    handleSubmit,
    setValue,
    setError,
    clearErrors
  } = useForm<EventFormInterface>();
  const [image, setImage] = useState<File>();
  const [startDate, setStartDate] = useState<Date>(() => {
    if (currentEvent?.id) {
      return currentEvent.start;
    } else {
      return new Date();
    }
  });

  const [endDate, setEndDate] = useState<Date>(() => {
    if (currentEvent?.id) {
      return currentEvent.end;
    } else {
      return timeFromNow(1);
    }
  });

  const formSubmitHandler: SubmitHandler<EventFormInterface> = async (data: EventFormInterface) => {
    if (data.web_link?.length === 0) {
      data.web_link = null;
    }

    if (space) {
      let isSuccess = false;

      if (currentEvent?.id) {
        isSuccess = await eventForm.updateEvent(data, space.id, currentEvent.id, image);
      } else {
        isSuccess = await eventForm.createEvent(data, space.id, image);
      }

      if (isSuccess) {
        eventList.fetchEvents(space.id);
        formDialog.close();
      }
    }
  };

  const handleStartDate = (date: Date) => {
    if (date && date >= new Date()) {
      setStartDate(date);
      const end = new Date(date);
      end.setHours(end.getHours() + 1);
      setEndDate(end);
    }
  };

  const handleEndDate = (date: Date) => {
    if (date && date > startDate) {
      setEndDate(date);
    }
  };

  const handleImage = (file: File | undefined) => {
    setImage(file);
  };

  useEffect(() => {
    return () => eventForm.resetModel();
  }, [eventForm]);

  useEffect(() => {
    if (startDate >= endDate) {
      setError('end', {message: t('errors.endDateGraterThanStartDate')});
      return;
    } else {
      clearErrors('end');
    }
    setValue('start', startDate);
    setValue('end', endDate);
  }, [clearErrors, endDate, setError, setValue, startDate]);

  return (
    <Dialog
      theme={theme}
      title={eventForm.currentEvent?.id ? t('eventForm.editTitle') : t('eventForm.addTitle')}
      headerStyle="uppercase"
      showCloseButton
      onClose={formDialog.close}
      approveInfo={{
        title: currentEvent?.id ? 'update' : 'submit',
        onClick: handleSubmit(formSubmitHandler),
        disabled: eventFormRequest.isPending
      }}
      hasBorder
    >
      <styled.Container data-testid="EventForm-test">
        <styled.Item>
          <Controller
            name="title"
            control={control}
            defaultValue={currentEvent?.title ? currentEvent?.title : ''}
            render={({field: {onChange, value}}) => (
              <Input
                value={value}
                onChange={onChange}
                theme={theme}
                label={t('eventForm.titleLabel')}
                placeholder={t('eventForm.titlePlaceholder')}
                errorMessage={t('eventForm.errorMessage')}
                isError={!!errors.title}
              />
            )}
            rules={{required: true}}
          />
        </styled.Item>
        <styled.Div>
          <styled.DateInput theme={theme}>
            <styled.Item>
              <DatePicker
                selected={startDate}
                onChange={handleStartDate}
                customInput={<Input label={t('eventForm.startDateTimeLabel')} />}
                selectsStart
                showTimeSelect
                timeInputLabel="Start Time"
                startDate={startDate}
                dateFormat={DATE_TIME_FORMAT}
                endDate={endDate}
              />
            </styled.Item>
          </styled.DateInput>
          <styled.DateInput theme={theme} className={cn(errors.end && 'error')}>
            <styled.Item>
              <DatePicker
                selected={endDate}
                onChange={handleEndDate}
                customInput={
                  <Input
                    label={t('eventForm.endDateTimeLabel')}
                    isError={!!errors.end}
                    errorMessage={errors.end?.message}
                  />
                }
                selectsEnd
                showTimeSelect
                timeInputLabel="End Time"
                startDate={startDate}
                dateFormat={DATE_TIME_FORMAT}
                endDate={endDate}
                minDate={startDate}
              />
            </styled.Item>
          </styled.DateInput>
        </styled.Div>
        <styled.Div>
          <styled.Item>
            <Controller
              name="hosted_by"
              control={control}
              defaultValue={currentEvent?.hosted_by ? currentEvent?.hosted_by : ''}
              render={({field: {onChange, value}}) => (
                <Input
                  value={value}
                  onChange={onChange}
                  theme={theme}
                  label={t('eventForm.hostLabel')}
                  placeholder={t('eventForm.hostPlaceholder')}
                  isError={!!errors.hosted_by}
                  errorMessage={t('eventForm.errorMessage')}
                />
              )}
              rules={{required: true}}
            />
          </styled.Item>
          <styled.Item>
            <Controller
              name="web_link"
              control={control}
              defaultValue={currentEvent?.web_link}
              render={({field: {onChange, value}}) => (
                <Input
                  value={value ?? undefined}
                  onChange={onChange}
                  theme={theme}
                  label={t('eventForm.linkLabel')}
                  placeholder={t('eventForm.linkPlaceholder')}
                />
              )}
            />
          </styled.Item>
        </styled.Div>
        <styled.Item>
          <Controller
            name="description"
            control={control}
            defaultValue={currentEvent?.description ? currentEvent?.description : ''}
            render={({field: {onChange, value}}) => (
              <TextArea
                value={value}
                onChange={onChange}
                name={t('eventForm.descriptionLabel')}
                placeholder={t('eventForm.descriptionPlaceholder')}
                isResizable
                isError={!!errors.description}
                errorMessage={t('eventForm.errorMessage')}
              />
            )}
            rules={{required: true}}
          />
        </styled.Item>
        <styled.FileUploaderItem>
          <styled.TileImageUpload>
            {(image || currentEvent?.image_hash) && (
              <styled.ImagePreview
                src={
                  (image && URL.createObjectURL(image)) ||
                  (currentEvent?.image_hash &&
                    `${appVariables.RENDER_SERVICE_URL}/get/${currentEvent.image_hash}`) ||
                  undefined
                }
              />
            )}
            <styled.CustomFileUploader
              label={image ? t('fileUploader.changeLabel') : t('fileUploader.uploadLabel')}
              dragActiveLabel={t('fileUploader.dragActiveLabel')}
              fileType="image"
              theme={theme}
              onFilesUpload={handleImage}
              buttonClassName="upload-button"
            />
          </styled.TileImageUpload>
        </styled.FileUploaderItem>
      </styled.Container>
    </Dialog>
  );
};

export default observer(EventForm);
