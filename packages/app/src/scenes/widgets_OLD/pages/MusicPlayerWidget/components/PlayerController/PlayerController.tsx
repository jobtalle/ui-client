import React, {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {SvgButton} from '@momentum-xyz/ui-kit';

import {useStore} from 'shared/hooks';

import * as styled from './PlayerController.styled';

const PlayerController: FC = () => {
  const {musicPlayerStore} = useStore().widgetStore_OLD;
  const {musicPlayer, play, playlist, pause, nextSong, previousSong} = musicPlayerStore;

  return (
    <styled.Container data-testid="PlayerController-test">
      <styled.Div>
        <SvgButton
          iconName="player-backward"
          size="normal"
          onClick={previousSong}
          disabled={!playlist.previousSongExists}
        />
        {musicPlayer.isPlaying ? (
          <SvgButton iconName="player-pause" size="medium-large" onClick={pause} />
        ) : (
          <SvgButton iconName="play-button" size="medium-large" onClick={play} />
        )}
        <SvgButton
          iconName="player-forward"
          size="normal"
          onClick={nextSong}
          disabled={!playlist.nextSongExists}
        />
      </styled.Div>
    </styled.Container>
  );
};

export default observer(PlayerController);