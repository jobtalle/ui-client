import React, {FC} from 'react';
import {observer} from 'mobx-react-lite';
import {useHistory} from 'react-router';

import {PageTopBar} from 'ui-kit';
import {ROUTES} from 'core/constants';
import {PropsWithThemeInterface} from 'ui-kit/interfaces';

import {RightSection} from './components';

interface PropsInterface extends PropsWithThemeInterface {
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
  spaceId?: string;
  editSpaceHidden?: boolean;
  isSpaceFavorite: boolean;
  isChatOpen?: boolean;
  toggleChat?: () => void;
  toggleIsSpaceFavorite: (spaceId: string) => void;
  isChat?: boolean;
  numberOfUnreadMessages?: number;
}

const SpaceTopBar: FC<PropsInterface> = ({
  title,
  subtitle,
  spaceId,
  isSpaceFavorite,
  toggleIsSpaceFavorite,
  isChatOpen,
  isAdmin,
  editSpaceHidden,
  toggleChat,
  children,
  isChat,
  numberOfUnreadMessages
}) => {
  const history = useHistory();

  return (
    <PageTopBar
      title={title}
      subtitle={subtitle}
      onClose={() => history.push(ROUTES.base)}
      actions={
        <>
          {!!spaceId && (
            <RightSection
              isChatOpen={isChatOpen}
              toggleChat={toggleChat}
              isAdmin={isAdmin}
              spaceId={spaceId}
              editSpaceHidden={editSpaceHidden}
              isSpaceFavorite={isSpaceFavorite}
              toggleIsSpaceFavorite={toggleIsSpaceFavorite}
              isChat={isChat}
              numberOfUnreadMessages={numberOfUnreadMessages}
            />
          )}
        </>
      }
    >
      {children}
    </PageTopBar>
  );
};

export default observer(SpaceTopBar);
