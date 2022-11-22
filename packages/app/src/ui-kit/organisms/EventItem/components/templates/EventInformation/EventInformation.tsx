import React, {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {ShowMoreText, Text} from '@momentum-xyz/ui-kit';
import {t} from 'i18next';

import {EventItemInterface} from 'core/models';

import * as styled from './EventInformation.styled';

interface PropsInterface {
  event: EventItemInterface;
}

const EventInformation: FC<PropsInterface> = ({event}) => {
  return (
    <styled.ContentRow>
      <styled.TextRow>
        <styled.DateRow>
          <Text
            text={event.startDate}
            size="l"
            weight="normal"
            align="left"
            transform="uppercase"
          />
          <Text text={event.startTime} size="l" weight="medium" align="left" />
          <Text
            text={`/ ${event.endDateAndTime}`}
            size="l"
            weight="normal"
            transform="uppercase"
            align="left"
          />
        </styled.DateRow>
        <styled.EventTitle
          text={event.data?.title}
          size="xl"
          weight="bold"
          align="left"
          transform="uppercase"
        />
        <ShowMoreText
          text={event.data?.description ?? ''}
          textProps={{
            size: 's',
            align: 'left',
            firstBoldSentences: 1
          }}
        />
      </styled.TextRow>
      <styled.AttendeesContainer>
        {event.attendeesList.attendees.length > 4 && (
          <styled.AttendeeContrainer>
            <styled.MoreAttendees>
              <styled.AttendeesCount text={event.attendeesCount} size="xs" weight="bold" />
            </styled.MoreAttendees>
            <styled.AttendeeNameText
              text={t('eventList.eventItem.moreAttendees')}
              size="xxs"
              align="center"
              isMultiline={false}
              transform="capitalized"
            />
          </styled.AttendeeContrainer>
        )}
        {event.attendeesList.attendees.slice(0, 4).map((attendee, index) => (
          <styled.AttendeeContrainer key={index}>
            <styled.AttendeeAvatar size="normal" avatarSrc={attendee.avatarSrc} />
            <styled.AttendeeNameText
              text={attendee.name}
              size="xxs"
              align="center"
              isMultiline={false}
              transform="capitalized"
            />
          </styled.AttendeeContrainer>
        ))}
      </styled.AttendeesContainer>
    </styled.ContentRow>
  );
};

export default observer(EventInformation);