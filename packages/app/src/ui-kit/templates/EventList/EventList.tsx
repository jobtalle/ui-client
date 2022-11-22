import React, {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {t} from 'i18next';
import {PropsWithThemeInterface} from '@momentum-xyz/ui-kit';

import {EventItemInterface, UserModelInterface} from 'core/models';
import {EventItem} from 'ui-kit';

import * as styled from './EventList.styled';

interface PropsInterface extends PropsWithThemeInterface {
  user?: UserModelInterface;
  events: EventItemInterface[];
  onEventEdit: (event: EventItemInterface) => void;
  onEventRemove: (event: EventItemInterface) => void;
  onWeblinkClick: (weblink: string) => void;
}

const EventList: FC<PropsInterface> = ({
  user,
  events,
  onEventEdit,
  onEventRemove,
  onWeblinkClick
}) => {
  if (events.length === 0) {
    return (
      <styled.Container className="empty noScrollIndicator">
        <styled.NoGatheringsPanel>
          <styled.NoGatheringsText text={t('eventList.noGatherings')} size="l" />
        </styled.NoGatheringsPanel>
      </styled.Container>
    );
  }

  return (
    <styled.Container className="noScrollIndicator" data-testid="EventList-test">
      {events.map((event, index) => (
        <EventItem
          user={user}
          key={event.data?.eventId}
          event={event}
          onEdit={onEventEdit}
          onRemove={onEventRemove}
          onWeblinkClick={onWeblinkClick}
        />
      ))}
    </styled.Container>
  );
};

export default observer(EventList);
