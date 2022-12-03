import {CoordinationInterface, IconSvg, Portal, useClickOutside} from '@momentum-xyz/ui-kit';
import {FC, useRef} from 'react';

import * as styled from './VoiceChatUserActions.styled';

interface PropsInterface {
  name: string;
  coords?: CoordinationInterface;
  onUserMute?: () => void;
  onUserKick?: () => void;
  onClose: () => void;
}

const VoiceChatUserActions: FC<PropsInterface> = ({
  name,
  coords,
  onUserMute,
  onUserKick,
  onClose
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    onClose();
  });

  return (
    <Portal>
      <styled.Container ref={ref} style={{...coords}}>
        <styled.Menu>
          <styled.Body>
            <styled.Action onClick={onUserMute}>
              <IconSvg name="microphoneOff" />
              <styled.ActionLabel text={`Mute ${name}`} weight="light" size="xxs" />
            </styled.Action>
            <styled.Action onClick={onUserKick}>
              <IconSvg name="remove-user" />
              <styled.ActionLabel text={`Kick ${name} from Voice`} weight="light" size="xxs" />
            </styled.Action>
          </styled.Body>
          <styled.Pointer />
        </styled.Menu>
      </styled.Container>
    </Portal>
  );
};

export default VoiceChatUserActions;