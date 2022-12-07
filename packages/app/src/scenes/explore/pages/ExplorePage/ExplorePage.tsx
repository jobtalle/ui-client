import React, {FC, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {getSnapshot} from 'mobx-state-tree';
import {Dialog} from '@momentum-xyz/ui-kit';
import {generatePath, useHistory} from 'react-router-dom';

import {useStore} from 'shared/hooks';
import {ExplorePanel} from 'ui-kit';
import {ROUTES} from 'core/constants';

import {SelectedOdyssey, StakingForm} from './components';
import * as styled from './ExplorePage.styled';

const ExplorePage: FC = () => {
  const {exploreStore, authStore, nftStore, map3dStore} = useStore();
  const {wallet} = authStore;

  const history = useHistory();

  useEffect(() => {
    exploreStore.init();
  }, [exploreStore]);

  useEffect(() => {
    (async () => {
      // TEMP
      await authStore.init();
      const {wallet} = authStore;
      if (!wallet) {
        return;
      }

      // FIXME move to more appropriate place
      console.log('Check if user has staked', wallet);
      const nftItem = nftStore.getNftByWallet(wallet);
      if (!nftItem) {
        console.log('User has no NFT', wallet);
        return;
      }
      // TODO check also other user wallets??
      await nftStore.fetchStakingInfo(wallet, nftItem.id);

      console.log('Staking info fetched');
      console.log('mutualStakingAddresses:', nftStore.mutualStakingAddresses);
      console.log('stakingAtMe:', getSnapshot(nftStore.stakingAtMe));
      console.log('stakingAtOthers:', getSnapshot(nftStore.stakingAtOthers));
    })();
  }, [authStore, nftStore, wallet]);

  return (
    <styled.Container>
      <styled.Wrapper>
        <styled.Boxes>
          {!!map3dStore.selectedOdyssey && (
            <SelectedOdyssey
              odyssey={map3dStore.selectedOdyssey}
              onTeleport={() => {
                console.log(map3dStore.selectedOdyssey);
                if (map3dStore.selectedOdyssey?.uuid) {
                  history.push(
                    generatePath(ROUTES.odyssey.base, {worldId: map3dStore.selectedOdyssey?.uuid})
                  );
                }
              }}
              onConnect={() => {
                if (map3dStore.selectedOdyssey) {
                  nftStore.setConnectToNftItemId(map3dStore.selectedOdyssey.id);
                }
              }}
              onDock={() => alert(`Dock`)}
              onClose={map3dStore.unselectOdyssey}
            />
          )}
        </styled.Boxes>

        {!!nftStore.connectToNftItemId && (
          <Dialog
            title="Personal Connecting Dashboard"
            icon="hierarchy"
            showCloseButton
            layoutSize={{height: '510px'}}
            onClose={() => {
              nftStore.setConnectToNftItemId(null);
            }}
          >
            <StakingForm
              nftItemId={nftStore.connectToNftItemId}
              onComplete={() => {
                nftStore.setConnectToNftItemId(null);
              }}
            />
          </Dialog>
        )}

        <styled.Boxes>
          <ExplorePanel
            odysseyCount={nftStore.nftItems.length}
            nftFeed={exploreStore.nftFeed}
            searchQuery={nftStore.searchQuery}
            odysseyList={nftStore.searchedNftItems}
            onSearch={nftStore.searchNft}
            onSelect={map3dStore.selectOdyssey}
            onTeleport={(nft) => {
              console.log(nft);
              if (nft.uuid) {
                history.push(generatePath(ROUTES.odyssey.base, {worldId: nft.uuid}));
              }
            }}
            // FIXME id type
            onConnect={(id) => nftStore.setConnectToNftItemId(+id)}
          />
        </styled.Boxes>
      </styled.Wrapper>
    </styled.Container>
  );
};

export default observer(ExplorePage);
