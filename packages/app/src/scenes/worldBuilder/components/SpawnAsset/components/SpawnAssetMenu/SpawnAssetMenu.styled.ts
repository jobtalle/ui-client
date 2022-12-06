import {rgba} from 'polished';
import styled from 'styled-components';

export const Container = styled.div`
  width: 232px;
  height: 100%;
  padding: 0 5px;
`;

export const Tab = styled.button`
  display: flex;
  padding: 15px;
  width: 100%;
  justify-content: left;

  &.selected {
    background: ${(props) => props.theme.accent && rgba(props.theme.accent, 0.1)};
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    border-radius: 10px;
  }
`;