import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {observer, useObserver} from 'mobx-react-lite';

import {SearchInput, useDebouncedEffect} from 'ui-kit';
import {OnlineUsersListInterface, UserProfileModelInterface} from 'core/models';
import {SEARCH_MINIMAL_CHARACTER_COUNT} from 'core/constants';
import {OnlineUsersStoreInterface} from 'scenes/home/stores/HomeStore/models';

import {UserItem} from './components';
import * as styled from './OnlineUsersList.styled';

export interface PropsInterface {
  invite?: boolean;
  worldId: string;
  onlineUsersStore?: OnlineUsersStoreInterface;
  changeKeyboardControl: (active: boolean) => void;
  profile?: UserProfileModelInterface;
  teleportToUser: (userId: string) => void;
  spaceId: string;
  onlineUsersList: OnlineUsersListInterface;
  excludedPeople?: string[];
}

const OnlineUsersList: React.FC<PropsInterface> = ({
  invite = false,
  worldId,
  onlineUsersList,
  onlineUsersStore,
  profile,
  teleportToUser,
  changeKeyboardControl,
  spaceId,
  excludedPeople = []
}) => {
  const {t} = useTranslation();

  useDebouncedEffect(
    () => {
      if (onlineUsersList.searchQuery.length >= SEARCH_MINIMAL_CHARACTER_COUNT) {
        onlineUsersList.searchUsers(worldId, true);
      }
    },
    200,
    [onlineUsersList.searchQuery, worldId]
  );

  useEffect(() => {
    onlineUsersList.setSearchQuery('');
    onlineUsersList.fetchUsers(worldId);
    const timeInterval = setInterval(() => {
      onlineUsersList.fetchUsers(worldId);
    }, 30000);

    return () => clearInterval(timeInterval);
  }, [onlineUsersList, worldId]);

  const handleClick = (id: string) => {
    if (onlineUsersStore?.selectedUserId !== id) {
      onlineUsersStore?.selectUser(id);
    } else {
      onlineUsersStore?.unselectUser();
    }
  };

  const handleSearchFocus = (isFocused: boolean) => {
    if (isFocused) {
      changeKeyboardControl(false);
    } else {
      changeKeyboardControl(true);
    }
  };

  const renderList = useObserver(() => {
    if (!onlineUsersList.users || !profile) {
      return;
    }

    const sortedUsers: UserProfileModelInterface[] = [];

    if (!invite && onlineUsersList.searchQuery.length < SEARCH_MINIMAL_CHARACTER_COUNT) {
      sortedUsers.push(profile);
    }

    if (invite) {
      sortedUsers.push(...onlineUsersList.filteredPeople([...excludedPeople, profile.uuid]));
    } else {
      sortedUsers.push(
        ...onlineUsersList.filteredPeople(
          onlineUsersList.searchQuery.length < SEARCH_MINIMAL_CHARACTER_COUNT ? [profile.uuid] : []
        )
      );
    }

    return sortedUsers.map((user) => (
      <UserItem
        key={user.uuid}
        user={user}
        onClick={() => handleClick(user.uuid)}
        invite={invite}
        profile={profile}
        teleportToUser={teleportToUser}
        spaceId={spaceId}
      />
    ));
  });

  return (
    <styled.Container data-testid="OnlineUsersList-test">
      <SearchInput
        value={onlineUsersList.searchQuery}
        onChange={onlineUsersList.setSearchQuery}
        placeholder={t('placeholders.searchForPeople')}
        onFocus={() => handleSearchFocus(true)}
        onBlur={() => handleSearchFocus(false)}
      />
      <styled.List>{renderList}</styled.List>
    </styled.Container>
  );
};

export default observer(OnlineUsersList);
