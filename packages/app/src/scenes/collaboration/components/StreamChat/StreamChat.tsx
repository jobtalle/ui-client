import React, {Component, FC} from 'react';
import {observer} from 'mobx-react-lite';
import {StreamChat, Channel} from 'stream-chat';
import {
  Chat,
  Channel as ChannelComponent,
  Window,
  VirtualizedMessageList,
  MessageInput,
  Streami18n
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';

import * as styled from './StreamChat.styled';
import {CustomMessageInput} from './components/';

interface PropsInterface {
  client: StreamChat;
  channel: Channel;
  fullWidth?: boolean;
}

interface StateInterface {
  isError: boolean;
}

class ErrorBoundaries extends Component<unknown, StateInterface> {
  state = {
    isError: false
  };

  componentDidCatch(error: unknown, errorInfo: unknown): void {
    // You can also log the error to an error reporting service
    console.log('Error in Stream Chat', error, errorInfo);
    this.setState({isError: true});
  }

  render() {
    if (this.state.isError) {
      return <div>Something went wrong</div>;
    }
    return <>{this.props.children}</>;
  }
}

const i18nInstance = new Streami18n({
  language: 'en'
  // there's also this, but probably it's not needed with set language
  // disableDateTimeTranslations: true
});

const SChat: FC<PropsInterface> = ({client, channel, fullWidth}) => {
  return (
    client &&
    channel && (
      <ErrorBoundaries>
        <styled.Container className={fullWidth ? 'full-width' : undefined}>
          <Chat client={client} theme="str-chat__theme-dark" i18nInstance={i18nInstance}>
            <ChannelComponent channel={channel} Input={CustomMessageInput}>
              <Window>
                <VirtualizedMessageList disableDateSeparator shouldGroupByUser />
                <MessageInput disableMentions={true} grow={true} maxRows={5} />
              </Window>
            </ChannelComponent>
          </Chat>
        </styled.Container>
      </ErrorBoundaries>
    )
  );
};

export default observer(SChat);
