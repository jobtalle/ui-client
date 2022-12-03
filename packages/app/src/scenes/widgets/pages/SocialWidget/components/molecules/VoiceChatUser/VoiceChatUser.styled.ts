import styled from 'styled-components';
import {Text, Avatar} from '@momentum-xyz/ui-kit';

export const Attendee = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const AttendeeAvatar = styled(Avatar)`
  border-color: ${(props) => props.theme.accent} !important;
  border-width: 2px !important;
`;

export const AttendeeName = styled(Text)`
  overflow: hidden;
  width: 60px;
`;
