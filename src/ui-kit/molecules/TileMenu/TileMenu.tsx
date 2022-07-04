import React, {FC} from 'react';
import {DraggableProvided} from 'react-beautiful-dnd';

import * as styled from './TileMenu.styled';

interface PropsInterface {
  onEdit: () => void;
  onDelete: () => void;
  provided?: DraggableProvided;
}

const TileMenu: FC<PropsInterface> = ({onEdit, onDelete, provided}) => {
  return (
    <styled.Container {...provided?.dragHandleProps}>
      <styled.SvgItem iconName="trash" size="normal" onClick={onDelete} isWhite />
      <styled.SvgItem iconName="pencil" size="normal" onClick={onEdit} isWhite />
      <styled.SvgItem iconName="direction-arrows" size="normal" isWhite />
    </styled.Container>
  );
};

export default TileMenu;
