import styled from 'styled-components';
import {rgba} from 'polished';

export const FeedItem = styled.div`
  padding: 10px 0 4px 0;
  display: flex;
  border-bottom: 1px solid ${(props) => props.theme.accent && rgba(props.theme.accent, 0.2)};
  flex-direction: row;
  gap: 8px;
`;

export const OneAvatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid var(--white);
`;

export const TwoAvatarsContainer = styled.div`
  position: relative;
  width: 60px;
`;

export const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--white);
`;

export const AvatarAhead = styled.img`
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--white);
  right: 0;
`;

export const Info = styled.div`
  padding: 5px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Date = styled.div`
  color: ${(props) => props.theme.accent};
  font-weight: 400;
  font-size: 8px;
`;

export const Actions = styled.div`
  padding: 2px 0 0 0;
  display: flex;
  gap: 6px;
`;