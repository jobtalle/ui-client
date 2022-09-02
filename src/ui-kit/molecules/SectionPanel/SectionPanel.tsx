import React, {FC} from 'react';

import {Heading, SvgButton} from 'ui-kit';

import * as styled from './SectionPanel.styled';

interface PropsInterface {
  title?: string;
  onAdd?: () => void;
  className?: string;
}

const SectionPanel: FC<PropsInterface> = ({title, children, className, onAdd}) => {
  return (
    <styled.Container className={className} data-testid="SectionPanel-test">
      <styled.Section>
        <styled.Header>
          {title && <Heading label={title} type="h1" align="left" transform="uppercase" />}
          {onAdd && <SvgButton iconName="add" size="medium-large" onClick={onAdd} />}
        </styled.Header>
        <styled.Body>{children}</styled.Body>
      </styled.Section>
    </styled.Container>
  );
};

export default SectionPanel;
