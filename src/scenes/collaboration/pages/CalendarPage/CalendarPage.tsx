import React, {FC, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useTheme} from 'styled-components';
import {t} from 'i18next';
import {toast} from 'react-toastify';
import {useHistory} from 'react-router';

import {ROUTES} from 'core/constants';
import {useStore} from 'shared/hooks';
import {absoluteLink} from 'core/utils';
import {Button, EventList, LinkDialog, ToastContent, SpaceTopBar, DeleteEventDialog} from 'ui-kit';

import {EventForm} from './components';
import * as styled from './CalendarPage.styled';

const CalendarPage: FC = () => {
  const {collaborationStore, sessionStore, widgetStore, mainStore, leaveMeetingSpace} = useStore();
  const {calendarStore, space} = collaborationStore;
  const {favoriteStore} = mainStore;
  const {eventList, formDialog, magicDialog, deleteConfirmationDialog} = calendarStore;
  const {attendeesListStore} = widgetStore;

  const theme = useTheme();
  const history = useHistory();

  const handleWeblink = (weblink: string) => {
    window.open(absoluteLink(weblink), '_blank');
  };

  const handleEventForm = () => {
    formDialog.open();
  };

  const handleMagicLinkOpen = (eventId: string) => {
    if (space) {
      calendarStore.showMagicLink(space.id, eventId);
    }
  };

  const handleEventDelete = async () => {
    if (space) {
      if (await calendarStore.removeEvent(space.id)) {
        toast.info(
          <ToastContent
            headerIconName="calendar"
            title={t('titles.alert')}
            text={t('messages.removeEventSuccess')}
            showCloseButton
          />
        );
      } else {
        toast.error(
          <ToastContent
            isDanger
            headerIconName="calendar"
            title={t('titles.alert')}
            text={t('errors.couldNotRemoveEvent')}
            showCloseButton
          />
        );
      }
    }
  };

  useEffect(() => {
    if (space) {
      eventList.fetchEvents(space.id);
    }

    return () => {
      eventList.resetModel();
      calendarStore.resetModel();
    };
  }, [eventList, space]);

  if (!space) {
    return null;
  }

  return (
    <styled.Container data-testid="CalendarPage-test">
      <SpaceTopBar
        title={space.name ?? ''}
        subtitle="calendar"
        isAdmin={space.isAdmin}
        spaceId={space.id}
        isSpaceFavorite={favoriteStore.isFavorite(space.id || '')}
        toggleIsSpaceFavorite={favoriteStore.toggleFavorite}
        editSpaceHidden
        showChatButton={false}
        onLeave={async () => {
          await leaveMeetingSpace();
          history.push(ROUTES.base);
        }}
      >
        {space.isAdmin && (
          <Button variant="primary" label="Add Gathering" theme={theme} onClick={handleEventForm} />
        )}
      </SpaceTopBar>
      <styled.InnerContainer>
        <EventList
          currentUserId={sessionStore.userId}
          events={eventList.events}
          onMagicLinkOpen={handleMagicLinkOpen}
          isLoading={eventList.areEventsLoading}
          onEventEdit={calendarStore.editEvent}
          onEventRemove={calendarStore.selectEventToRemove}
          onWeblinkClick={handleWeblink}
          onShowAttendeesList={attendeesListStore.showAttendees}
          canManageInSpace={space.isAdmin}
          eventDeleted={calendarStore.removeEventRequest.isDone}
        />
      </styled.InnerContainer>
      {calendarStore.formDialog.isOpen && <EventForm />}

      {calendarStore.magicId && magicDialog.isOpen && (
        <LinkDialog
          title={t('eventList.eventItem.magicLinkDialog.title')}
          copyLabel={t('eventList.eventItem.magicLinkDialog.copyLabel')}
          link={`${window.location.protocol}//${window.location.host}/magic/${calendarStore.magicId}`}
          onClose={magicDialog.close}
        />
      )}

      {deleteConfirmationDialog.isOpen && (
        <DeleteEventDialog
          onConfirmation={handleEventDelete}
          onClose={deleteConfirmationDialog.close}
        />
      )}
    </styled.Container>
  );
};

export default observer(CalendarPage);
