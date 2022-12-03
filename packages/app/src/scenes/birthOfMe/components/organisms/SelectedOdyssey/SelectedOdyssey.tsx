import React, {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {Button, Heading, IconSvg, SvgButton, Text} from '@momentum-xyz/ui-kit';

import {Box} from 'ui-kit';
import {OdysseyItemInterface} from 'scenes/birthOfMe/stores/ExploreStore';

import * as styled from './SelectedOdyssey.styled';

interface PropsInterface {
  odyssey: OdysseyItemInterface;
  onTeleport: () => void;
  onConnect: () => void;
  onDock: () => void;
  onClose: () => void;
}

const SelectedOdyssey: FC<PropsInterface> = (props) => {
  const {odyssey, onTeleport, onDock, onConnect, onClose} = props;

  return (
    <Box size="small">
      <styled.Header>
        <Heading type="h1" label={odyssey.name} transform="uppercase" isTruncate />
        <SvgButton iconName="close" size="normal" onClick={onClose} />
      </styled.Header>
      <styled.Container>
        <styled.Avatar src={odyssey.image} />
        <styled.Actions>
          <Button size="small" label="Visit" icon="fly-to" onClick={onTeleport} />
          <Button size="small" label="Connect" icon="hierarchy" onClick={onConnect} />
          <Button size="small" label="Dock" icon="people" onClick={onDock} />
        </styled.Actions>
      </styled.Container>
      <styled.Description>
        <Text size="xxs" text={odyssey.description} align="left" />
      </styled.Description>

      <styled.Statistics>Statistics</styled.Statistics>

      <styled.StatisticsData>
        <styled.StatisticsItem>
          <IconSvg name="hierarchy" size="medium" />
          <styled.StatisticsValue>{odyssey.connections} connections</styled.StatisticsValue>
        </styled.StatisticsItem>
        <styled.StatisticsItem>
          <IconSvg name="people" size="medium" />
          <styled.StatisticsValue>{odyssey.docking} docking</styled.StatisticsValue>
        </styled.StatisticsItem>
        <styled.StatisticsItem>
          <IconSvg name="calendar" size="medium" />
          <styled.StatisticsValue>{odyssey.events} events</styled.StatisticsValue>
        </styled.StatisticsItem>
      </styled.StatisticsData>
    </Box>
  );
};

export default observer(SelectedOdyssey);