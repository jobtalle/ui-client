import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';

import {SearchInput, useDebouncedEffect} from 'ui-kit';
import {OnlineUsersListInterface, UserProfileModelInterface} from 'core/models';
import {SEARCH_MINIMAL_CHARACTER_COUNT} from 'core/constants';
import {OnlineUsersStoreInterface} from 'scenes/widgets/stores/OnlineUsersStore';

import {UserItem} from './components';
import * as styled from './OnlineUsersList.styled';

export interface OnlineUsersListProps {
  invite?: boolean;
  worldId: string;
  onlineUsersStore: OnlineUsersStoreInterface;
  searchQuery: string;
  changeKeyboardControl: (active: boolean) => void;
  profile?: UserProfileModelInterface;
  teleportToUser: (userId: string, push: (path: string) => void) => void;
  spaceId: string;
  onlineUsersList: OnlineUsersListInterface;
}

const OnlineUsersList: React.FC<OnlineUsersListProps> = ({
  invite = false,
  worldId,
  onlineUsersStore,
  onlineUsersList,
  searchQuery,
  profile,
  teleportToUser,
  changeKeyboardControl,
  spaceId
}) => {
  const {t} = useTranslation();

  useDebouncedEffect(
    () => {
      if (searchQuery.length >= SEARCH_MINIMAL_CHARACTER_COUNT) {
        onlineUsersStore.searchUsers(worldId, true);
      }
    },
    200,
    [searchQuery, worldId]
  );

  useEffect(() => {
    onlineUsersStore.setSearchQuery('');
    onlineUsersStore.fetchUsers(worldId);
    const timeInterval = setInterval(() => {
      onlineUsersStore.fetchUsers(worldId);
    }, 30000);

    return () => clearInterval(timeInterval);
  }, []);

  const handleClick = (id: string) => {
    if (onlineUsersStore.selectedUserId !== id) {
      onlineUsersStore.selectUser(id);
    } else {
      onlineUsersStore.unselectUser();
    }
  };

  const handleSearchFocus = (isFocused: boolean) => {
    if (isFocused) {
      changeKeyboardControl(false);
    } else {
      changeKeyboardControl(true);
    }
  };

  const renderList = () => {
    if (!onlineUsersList.users || !profile) {
      return;
    }

    if (searchQuery.length >= SEARCH_MINIMAL_CHARACTER_COUNT) {
      return onlineUsersList.searchedUsers
        .filter((user) => (invite ? user.uuid !== profile?.uuid : true))
        .map((user) => (
          <UserItem
            user={user}
            key={user.uuid}
            onClick={() => handleClick(user.uuid)}
            invite={invite}
            profile={profile}
            teleportToUser={teleportToUser}
            spaceId={spaceId}
          />
        ));
    }

    const sortedUsers: UserProfileModelInterface[] = [
      ...(invite ? [] : onlineUsersList.users.filter((user) => user.uuid === profile.uuid)),
      ...onlineUsersList.users.filter((user) => user.uuid !== profile.uuid)
    ];

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
  };

  return (
    <styled.Container>
      <SearchInput
        value={searchQuery}
        onChange={onlineUsersStore.setSearchQuery}
        placeholder={t('placeholders.searchForPeople')}
        onFocus={() => handleSearchFocus(true)}
        onBlur={() => handleSearchFocus(false)}
      />
      <styled.List>{renderList()}</styled.List>
    </styled.Container>
  );
};

export default OnlineUsersList;
