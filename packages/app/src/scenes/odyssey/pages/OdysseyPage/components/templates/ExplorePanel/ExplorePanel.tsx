import React, {FC, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useTranslation} from 'react-i18next';
import {Heading, Loader, SearchInput, Text, useDebouncedCallback} from '@momentum-xyz/ui-kit';

import {useStore} from 'shared/hooks';

import {SpaceList, SpaceDetails} from './components';
import * as styled from './ExplorePanel.styled';

const PANEL_WIDTH_PX = 200;
const SEARCH_DELAY_MS = 200;

const ExplorePanel: FC = () => {
  const {odysseyStore, mainStore} = useStore();
  const {unityStore, worldStore} = mainStore;
  const {exploreStore} = odysseyStore;
  const {searchQuery, spaceDetails, history} = exploreStore;

  const {t} = useTranslation();

  useEffect(() => {
    if (!exploreStore.worldId) {
      exploreStore.init(worldStore.worldId);
    }
  }, [exploreStore, worldStore.worldId]);

  const debouncedSearch = useDebouncedCallback(exploreStore.search, SEARCH_DELAY_MS);

  return (
    <styled.CustomExpandableLayout
      iconName="explore"
      name={t('labels.explore')}
      isExpanded={exploreStore.isExpanded}
      setExpand={exploreStore.setExpand}
      size={{width: `${PANEL_WIDTH_PX}px`}}
    >
      <SearchInput
        value={searchQuery.query}
        placeholder={t(`placeholders.searchForSpaces`)}
        onFocus={() => unityStore.changeKeyboardControl(false)}
        onBlur={() => unityStore.changeKeyboardControl(true)}
        onChange={(query) => {
          searchQuery.setQuery(query);
          debouncedSearch();
        }}
      />

      {!searchQuery.isQueryValid && !!spaceDetails && !exploreStore.isLoading && (
        <styled.Body>
          <SpaceDetails
            space={spaceDetails}
            previousSpace={history.previousSpace}
            isWorld={spaceDetails.id === worldStore.worldId}
            onTeleportToSpace={unityStore.teleportToSpace}
            onSelectSpace={exploreStore.selectSpace}
            onGoBack={exploreStore.goBackToPreviousSpace}
          />
        </styled.Body>
      )}

      {searchQuery.isQueryValid && (
        <styled.Body>
          <styled.Heading>
            <Heading
              label={t('labels.searchResults')}
              type="h1"
              align="left"
              transform="uppercase"
            />
          </styled.Heading>
          <SpaceList
            spaceListByCategory={exploreStore.searchResults}
            onTeleportToSpace={unityStore.teleportToSpace}
            onSelectSpace={exploreStore.selectSpace}
          />
          {exploreStore.searchResults.length === 0 && !exploreStore.isLoading && (
            <styled.EmptyResult>
              <Text text={t('messages.noResultsFound')} size="xs" />
            </styled.EmptyResult>
          )}
        </styled.Body>
      )}

      {exploreStore.isLoading && (
        <styled.Loader>
          <Loader />
        </styled.Loader>
      )}
    </styled.CustomExpandableLayout>
  );
};

export default observer(ExplorePanel);