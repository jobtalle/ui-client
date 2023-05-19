import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;

  max-height: calc(100vh - var(--height-offset) - 235px);
  overflow: scroll;
`;

export const SkyboxContainer = styled.button`
  width: 160px;
`;
export const SkyboxInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SkyboxName = styled.span`
  width: 140px;
  text-align: center;
  color: ${(props) => props.theme.text};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
