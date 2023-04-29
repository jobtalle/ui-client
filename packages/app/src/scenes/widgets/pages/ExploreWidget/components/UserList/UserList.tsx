import {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {useI18n} from '@momentum-xyz/core';
import {
  Input,
  Frame,
  Slider,
  ItemCard,
  stringInputMask,
  SliderItemInterface,
  ImageSizeEnum
} from '@momentum-xyz/ui-kit-storybook';

import {getImageAbsoluteUrl} from 'core/utils';
import {SearchQueryModelModelType, UserInfoModelInterface} from 'core/models';

import * as styled from './UserList.styled';

interface PropsInterface {
  searchQuery: SearchQueryModelModelType;
  searchResults: UserInfoModelInterface[];
  lastCreatedUsers: SliderItemInterface<string>[];
  mostStakedUsers: SliderItemInterface<string>[];
  onSelectUser: (userId: string) => void;
}

const UserList: FC<PropsInterface> = ({
  searchQuery,
  searchResults,
  lastCreatedUsers,
  mostStakedUsers,
  onSelectUser
}) => {
  const {t} = useI18n();

  return (
    <styled.Wrapper data-testid="UserList-test">
      <Frame>
        <styled.Search>
          <Input
            isSearch
            isClearable
            value={searchQuery.query}
            placeholder={t('actions.searchMembers')}
            opts={stringInputMask}
            onChange={searchQuery.setQuery}
            wide
          />
        </styled.Search>
      </Frame>
      <styled.ScrollableContainer>
        {searchQuery.isQueryValid ? (
          <styled.SearchContainer>
            <styled.SearchResultTitle>
              {`${searchResults.length} ${t('labels.results')}`}
            </styled.SearchResultTitle>

            {searchResults.map((item) => (
              <ItemCard
                key={item.id}
                name={item.name}
                imageErrorIcon="astronaut"
                description={item.profile.bio}
                imageUrl={getImageAbsoluteUrl(item.profile.avatarHash, ImageSizeEnum.S5)}
                onInfoClick={() => onSelectUser(item.id)}
              />
            ))}
          </styled.SearchContainer>
        ) : (
          <styled.PopularContainer>
            <styled.BlockTitle>{t('labels.bigStakers')}</styled.BlockTitle>
            <styled.Carousel>
              <Slider
                items={mostStakedUsers}
                errorIcon="astronaut"
                onClick={(uuid) => onSelectUser(uuid)}
              />
            </styled.Carousel>
            <styled.BlockTitle>{t('labels.newMembers')}</styled.BlockTitle>
            <styled.Carousel>
              <Slider
                items={lastCreatedUsers}
                errorIcon="astronaut"
                onClick={(uuid) => onSelectUser(uuid)}
              />
            </styled.Carousel>
          </styled.PopularContainer>
        )}
      </styled.ScrollableContainer>
    </styled.Wrapper>
  );
};

export default observer(UserList);
