import {FC, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';

import {usePosBusEvent} from 'shared/hooks';
import {PosBusEmojiMessageType} from 'core/types';

import {EmojiWithAvatarAnimation, MegamojiAnimation} from './components';

const ANIMATION_DURATION_SEC = 5;

// TODO make it model
interface EmojiItemInterface {
  type: 'emoji' | 'megamoji';
  emojiUrl: string | null;
  emojiMsg: PosBusEmojiMessageType | null;
  idx: number;
  offset: number;
}
type EmojiItemInterfaceStoreType = Set<EmojiItemInterface>;

const EmojiAnimationDock: FC = () => {
  const [items, setItems] = useState<EmojiItemInterfaceStoreType>(() => new Set());
  const refIndex = useRef(1);

  const newEmojiHandler =
    (type: EmojiItemInterface['type']) => (emojiUrlOrMsg: string | PosBusEmojiMessageType) => {
      const item: EmojiItemInterface = {
        type,
        emojiUrl: typeof emojiUrlOrMsg === 'string' ? (emojiUrlOrMsg as string) : null,
        emojiMsg:
          typeof emojiUrlOrMsg === 'object' ? (emojiUrlOrMsg as PosBusEmojiMessageType) : null,
        idx: refIndex.current++,
        offset: Math.ceil(Math.random() * 100)
      };

      setItems((items) => new Set(items).add(item));
      console.log('MOUNT', item);

      setTimeout(() => {
        console.log('UNMOUNT', item);
        setItems((items) => {
          const s = new Set(items);
          s.delete(item);
          return s;
        });
      }, ANIMATION_DURATION_SEC * 1000);
    };

  usePosBusEvent('emoji', newEmojiHandler('emoji'));
  usePosBusEvent('megamoji', newEmojiHandler('megamoji'));

  const renderItems = () => {
    return Array.from(items).map(
      ({idx, emojiMsg, emojiUrl, offset}) =>
        (emojiMsg && <EmojiWithAvatarAnimation key={idx} emojiMsg={emojiMsg} offset={offset} />) ||
        (emojiUrl && <MegamojiAnimation key={idx} emojiUrl={emojiUrl} offset={offset} />) || <></>
    );
  };

  return <>{renderItems()}</>;
};

export default observer(EmojiAnimationDock);
