import React, {FC} from 'react';
import {t} from 'i18next';
import AddToCalendarHOC, {SHARE_SITES} from 'react-add-to-calendar-hoc';
import {observer} from 'mobx-react-lite';
import cn from 'classnames';

import {EventItemModelInterface} from 'core/models/EventItem';
import {AddToCalendarDropdown, Button, IconSvg, ShowMoreText, Text} from 'ui-kit';
import {appVariables} from 'api/constants';
import {EventStoreInterface} from 'stores/MainStore/models';

import {Header, Actions} from './components';
import * as styled from './EventItem.styled';

interface PropsInterface {
  eventStore: EventStoreInterface;
  currentUserId: string;
  onEdit?: (event: EventItemModelInterface) => void;
  onRemove?: (eventId: string) => void;
  onMagicLinkOpen: (eventId: string, spaceId?: string) => void;
  zIndex?: number;
  isWorldCalendar?: boolean;
  onFlyToGathering?: (spaceId: string) => void;
  onFlyToSpace?: (spaceId: string) => void;
  onWeblinkClick: (weblink: string) => void;
}

const EventItem: FC<PropsInterface> = ({
  eventStore,
  currentUserId,
  onEdit,
  onRemove,
  zIndex,
  isWorldCalendar = false,
  onMagicLinkOpen,
  onFlyToGathering,
  onFlyToSpace,
  onWeblinkClick
}) => {
  const AddToCalendarComponent = AddToCalendarHOC(Button, AddToCalendarDropdown);

  const handleAttendingButtonClick = () => {
    if (eventStore.isAttending(currentUserId)) {
      eventStore.stopAttending();
    } else {
      eventStore.attend();
    }
  };

  if (!eventStore.event) {
    return null;
  }

  const buttons = () => (
    <styled.Buttons className="base">
      <styled.Buttons>
        {isWorldCalendar && eventStore.event.spaceId && (
          <Button
            label={`${t('eventList.eventItem.flyToSpace')} ${
              eventStore.event.spaceName && eventStore.event.spaceName.slice(0, 12)
            } ${
              eventStore.event.spaceName && (eventStore.event.spaceName.length > 12 ? '...' : '')
            }`}
            isCustom
            transform="capitalized"
            onClick={() => {
              onFlyToSpace?.(eventStore.event?.spaceId ?? '');
            }}
            icon="fly-to"
            noWhitespaceWrap
          />
        )}

        <Button
          onClick={() => {
            if (eventStore.event) {
              onMagicLinkOpen(eventStore.event.id, eventStore.event.spaceId ?? undefined);
            }
          }}
          label={t('eventList.eventItem.gatheringLink')}
          icon="location"
          transform="capitalized"
          isCustom
        />
        {!!eventStore.event.web_link && (
          <Button
            label={t('eventList.eventItem.websiteLink')}
            icon="link"
            transform="capitalized"
            isCustom
            onClick={() => {
              if (eventStore.event?.web_link) {
                onWeblinkClick(eventStore.event.web_link);
              }
            }}
          />
        )}
      </styled.Buttons>
      <styled.Buttons>
        <Button
          variant="primary"
          label={t('eventList.eventItem.attendees', {count: eventStore.numberOfAllAttendees})}
          transform="capitalized"
        />
        {eventStore.event.isLive ? (
          <styled.LiveIndicator>
            <IconSvg name="live" size="medium-large" isWhite />
            <p>{t('eventList.eventItem.live')}</p>
          </styled.LiveIndicator>
        ) : (
          <styled.AttendeesButton
            variant="primary"
            icon={eventStore.isAttending(currentUserId) ? 'check' : 'add'}
            disabled={eventStore.attendRequest.isPending}
            label={t('eventList.eventItem.interested')}
            transform="capitalized"
            onClick={handleAttendingButtonClick}
            className={cn(eventStore.isAttending(currentUserId) && 'interested')}
          />
        )}
        {!eventStore.event.isLive && (
          <AddToCalendarComponent
            event={eventStore.asCalendarEvent}
            buttonProps={{
              label: t('eventList.eventItem.addToCalendar'),
              icon: 'calendar',
              isCustom: true,
              transform: 'capitalized',
              noWhitespaceWrap: true
            }}
            items={[SHARE_SITES.GOOGLE, SHARE_SITES.ICAL, SHARE_SITES.OUTLOOK]}
            className="AddToCalendarContainer"
          />
        )}
        {eventStore.event.isLive && isWorldCalendar && eventStore.event.id && (
          <Button
            variant="inverted"
            icon="fly-to"
            label={t('eventList.eventItem.joinGathering')}
            transform="capitalized"
            onClick={() => {
              if (eventStore.event?.spaceId) {
                onFlyToGathering?.(eventStore.event.spaceId);
              }
            }}
          />
        )}
      </styled.Buttons>
    </styled.Buttons>
  );

  const date = () => (
    <styled.DateRow>
      <Text
        text={eventStore.event.startDate}
        size="l"
        weight="bold"
        align="left"
        transform="uppercase"
      />
      <Text text={eventStore.event.startTime} size="l" align="left" />
      <Text
        text={`${t('eventList.eventItem.to')} ${eventStore.event.endDateAndTime}`}
        size="l"
        transform="uppercase"
        align="left"
      />
    </styled.DateRow>
  );

  const info = () => (
    <styled.Div>
      <styled.Info>
        <styled.ContentRow>
          <styled.TextRow>
            <Header event={eventStore.event} isWorldCalendar={isWorldCalendar} />
            {date()}
            <ShowMoreText
              text={eventStore.event.description}
              textProps={{
                size: 's',
                align: 'left',
                firstBoldSentences: 1,
                isCustom: true
              }}
              isCustom
            />
          </styled.TextRow>
          <styled.AttendeesContainer>
            {eventStore.attendees.map((attendee) => (
              <styled.AttendeeContrainer key={attendee.id}>
                <styled.AttendeeAvatar size="normal" avatarSrc={attendee.avatarSrc} />
                <styled.AttendeeNameText
                  text={attendee.name}
                  size="s"
                  align="center"
                  isMultiline={false}
                />
              </styled.AttendeeContrainer>
            ))}
          </styled.AttendeesContainer>
        </styled.ContentRow>
        {buttons()}
        <Actions event={eventStore.event} onEdit={onEdit} onRemove={onRemove} />
      </styled.Info>
    </styled.Div>
  );

  const image = () => (
    <styled.ImageContainer>
      {eventStore.event.image_hash ? (
        <img
          alt={eventStore.event.image_hash}
          src={`${appVariables.RENDER_SERVICE_URL}/get/${eventStore.event.image_hash}`}
        />
      ) : (
        <img alt="placeholder" src="/img/events/placeholder.png" />
      )}
    </styled.ImageContainer>
  );

  return (
    <styled.Container style={{zIndex: zIndex}} id={eventStore.event.id}>
      <styled.Row className="header">{image()}</styled.Row>
      {info()}
    </styled.Container>
  );
};

export default observer(EventItem);
