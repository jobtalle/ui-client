import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
`;

export const Wrapper = styled.div`
  padding: 12px 0 0 0;
  position: relative;
`;

export const Steps = styled.div`
  position: absolute;
  right: 0;
  top: -8px;
  z-index: 1;
`;

export const WordContainer = styled.div`
  padding: 5px 0 0 0;
  position: relative;
`;

export const WorldName = styled.div`
  position: absolute;
  bottom: 15px;
  left: 20px;
  right: 20px;
  font-weight: 700;
  font-size: var(--font-size-l);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;
