import React, {FC, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useHistory} from 'react-router-dom';

import {ROUTES} from 'core/constants';
import {useStore} from 'shared/hooks';
import {SinusBox, ExplorePanel} from 'ui-kit';

import {BuildOdyssey} from './components';
import * as styled from './BirthOfMePage.styled';

const BirthOfMePage: FC = () => {
  const {exploreStore, authStore} = useStore();
  const {nftStore} = authStore;

  const history = useHistory();

  useEffect(() => {
    exploreStore.init();
  }, [exploreStore]);

  return (
    <styled.Container>
      <styled.Wrapper>
        <styled.Boxes>
          <SinusBox />
          <BuildOdyssey onBuild={() => history.push(ROUTES.explore)} />
        </styled.Boxes>

        <styled.Boxes>
          <ExplorePanel
            odysseyCount={nftStore.nftItems.length}
            newsFeed={exploreStore.newsFeed}
            searchQuery={exploreStore.searchQuery}
            odysseyList={exploreStore.odysseyList}
            onSearch={exploreStore.searchOdysseys}
            onTeleport={(id) => alert(`Teleport to ${id}`)}
            onConnect={(id) => alert(`Connect to ${id}`)}
          />
        </styled.Boxes>
      </styled.Wrapper>
    </styled.Container>
  );
};

export default observer(BirthOfMePage);
