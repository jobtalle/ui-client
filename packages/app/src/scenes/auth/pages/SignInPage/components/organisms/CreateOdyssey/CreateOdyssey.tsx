import React, {FC} from 'react';
import {Button, Text} from '@momentum-xyz/ui-kit';

import {Box} from 'ui-kit';
import image from 'static/images/world.svg';

import * as styled from './CreateOdyssey.styled';

interface PropsInterface {
  onCreate: () => void;
}

const CreateOdyssey: FC<PropsInterface> = ({onCreate}) => {
  return (
    <Box>
      <styled.Div>
        <Text size="m" text="Create your Odyssey" align="left" />
        <styled.Image src={image} />
        <div>
          <Text
            size="m"
            text='You need a wallet to get started. If you already have one, click on "Create your Odyssey". Or read more about getting a wallet on '
            align="left"
          />
          <styled.Link target="_blank" href="https://discover.odyssey.org">
            discover.odyssey.org
          </styled.Link>
        </div>

        <Button size="medium" label="Create your Odyssey" wide onClick={onCreate} />
      </styled.Div>
    </Box>
  );
};

export default CreateOdyssey;