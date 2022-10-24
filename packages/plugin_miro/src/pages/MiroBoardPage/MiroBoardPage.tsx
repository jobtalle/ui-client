import React, {FC, useCallback, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useTheme} from 'styled-components';
import {useSpaceGlobalProps} from '@momentum-xyz/sdk';
import {appVariables} from 'api/constants';
import {MiroBoardInterface, MiroStateInterface} from 'core/interfaces';

import {MiroBoard, MiroChoice, MiroActions} from './components';
import * as styled from './MiroBoardPage.styled';

const MiroBoardPage: FC = () => {
  const {renderTopBarActions} = useSpaceGlobalProps();

  const theme = useTheme();

  const {spaceId, isSpaceAdmin, init, setPluginSpaceStateSubField, spacePluginState} =
    useSpaceGlobalProps();

  const miroPluginState: MiroStateInterface = spacePluginState;

  const pickBoard = useCallback(() => {
    miroBoardsPicker.open({
      action: 'access-link',
      clientId: appVariables.APP_ID,
      success: async (data: MiroBoardInterface) => {
        for (const [key, value] of Object.entries(data)) {
          await setPluginSpaceStateSubField('board', key, value);
        }
      }
    });
  }, [setPluginSpaceStateSubField]);

  useEffect(() => {
    init(['board']);
  }, [init]);

  useEffect(() => {
    renderTopBarActions?.({
      main: () => (
        <MiroActions
          theme={theme}
          spaceId={spaceId}
          isAdmin={isSpaceAdmin}
          board={miroPluginState.board}
          pick={pickBoard}
          disable={() => setPluginSpaceStateSubField('board', 'accessLink', null)}
        />
      )
    });
  }, [
    isSpaceAdmin,
    renderTopBarActions,
    spaceId,
    theme,
    miroPluginState.board,
    pickBoard,
    setPluginSpaceStateSubField
  ]);

  if (!spaceId) {
    return null;
  }

  return (
    <styled.Container>
      {!miroPluginState.board?.accessLink ? (
        <MiroChoice isAdmin={isSpaceAdmin} pickBoard={pickBoard} />
      ) : (
        <MiroBoard miroUrl={miroPluginState.board.accessLink} />
      )}
    </styled.Container>
  );
};

export default observer(MiroBoardPage);
