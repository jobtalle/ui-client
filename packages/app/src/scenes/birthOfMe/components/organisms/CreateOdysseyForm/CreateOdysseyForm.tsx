import React, {FC} from 'react';
import {Button, FileUploader, IconSvg, InputDark, Text} from '@momentum-xyz/ui-kit';

import {Box} from 'ui-kit';

import * as styled from './CreateOdysseyForm.styled';

interface PropsInterface {
  onCreate: () => void;
}

const CreateOdysseyForm: FC<PropsInterface> = ({onCreate}) => {
  return (
    <Box>
      <styled.Div>
        <Text size="m" text="2. Mint your Odyssey" align="left" />
        <Text size="m" text="Choose an image for your odyssey" align="left" />
        <styled.Avatar>
          <styled.AvatarImageUpload>
            <styled.AvatarImageInner>
              <FileUploader
                label="Upload Image"
                dragActiveLabel="Drop the files here..."
                fileType="image"
                buttonSize="medium"
                onFilesUpload={(file) => console.log(file)}
                maxSize={10 * Math.pow(2, 20)}
                onError={(error) => console.error(error)}
                enableDragAndDrop={false}
              />
            </styled.AvatarImageInner>
          </styled.AvatarImageUpload>
        </styled.Avatar>

        <Text size="m" text="What should we call you?" align="left" />
        <styled.ImageContainer>
          <IconSvg name="profile" size="large" />
          <InputDark variant="secondary" placeholder="Choose your name" />
        </styled.ImageContainer>

        <Text
          size="m"
          text="All set, let’s go! Create an NFT with your personal odyssey"
          align="left"
        />
        <Button size="medium" label="Create your Odyssey" icon="planet" onClick={onCreate} />
      </styled.Div>
    </Box>
  );
};

export default CreateOdysseyForm;