import {FC, useCallback, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {generatePath, useHistory, useParams} from 'react-router-dom';

import AssetsGrid from 'scenes/odysseyCreator/pages/SpawnAssetPage/components/AssetsGrid/AssetsGrid';
import {Asset3dCategoryEnum} from 'api/enums';
import {useStore} from 'shared/hooks';
import {Asset3dInterface} from 'core/models';
import {ROUTES} from 'core/constants';

import * as styled from './AssetsPage.styled';

interface PropsInterface {
  assetCategory: Asset3dCategoryEnum;
}

const AssetsPage: FC<PropsInterface> = ({assetCategory}) => {
  const {odysseyCreatorStore} = useStore();
  const {spawnAssetStore} = odysseyCreatorStore;

  const history = useHistory();

  const {worldId} = useParams<{worldId: string}>();

  useEffect(() => {
    spawnAssetStore.fetchAssets3d(assetCategory);

    return () => {
      spawnAssetStore.clearAssets();
    };
  }, [spawnAssetStore, assetCategory]);

  const handleSelected = useCallback(
    (asset: Asset3dInterface) => {
      spawnAssetStore.selectAsset(asset);
      history.push(
        generatePath(ROUTES.odyssey.creator.spawnAsset.selected, {
          worldId,
          assetCategory
        })
      );
    },
    [history, spawnAssetStore, worldId, assetCategory]
  );

  return (
    <styled.Contaier>
      <AssetsGrid assets={spawnAssetStore.assets3d} onSelected={handleSelected} />
    </styled.Contaier>
  );
};

export default observer(AssetsPage);