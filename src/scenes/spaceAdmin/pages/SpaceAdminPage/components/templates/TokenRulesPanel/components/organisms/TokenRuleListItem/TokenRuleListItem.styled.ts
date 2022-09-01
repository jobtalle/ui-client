import styled from 'styled-components';

export const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;

  .token-rule-type {
    opacity: 0.5;
  }
`;

export const Buttons = styled.div`
  display: flex;
  gap: 10px;
`;