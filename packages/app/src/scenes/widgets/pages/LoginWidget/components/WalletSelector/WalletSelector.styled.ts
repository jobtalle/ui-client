import {rgba} from 'polished';
import styled from 'styled-components';

export const Methods = styled.div`
  padding: 20px 1px 30px 1px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px 40px;
`;

export const MethodItem = styled.button`
  width: 100%;
  height: 102px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px, 6px, 10px, 6px;
  background: ${(props) => props.theme.accentBg && rgba(props.theme.accentBg, 0.4)};
  border: 1px solid ${(props) => props.theme.accentText && rgba(props.theme.accentText, 0.6)};
  transition: all var(--tr-150-ei);

  &:hover,
  &.active {
    background: ${(props) => props.theme.accentBg};
    border: 1px solid ${(props) => props.theme.accentText};
  }

  & > span {
    font-size: var(--font-size-xs);
    font-weight: 500;
    line-height: 18px;
    letter-spacing: 0.08em;
    text-align: center;
    color: ${(props) => props.theme.text};
  }

  & > img {
    max-width: 64px;
    height: 64px;
    margin-bottom: 4px;
  }
`;
