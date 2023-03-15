import {AttributeValueInterface} from '@momentum-xyz/sdk';
import {Client, loadClientWorker} from '@momentum-xyz/posbus-client';

import {VoiceChatActionEnum} from 'api/enums';
import {PosBusEventEmitter} from 'core/constants';
import {PosBusMessageTypeEnum, PosBusNotificationEnum} from 'core/enums';
import {
  PosBusVibeMessageType,
  PosBusHigh5MessageType,
  PosBusMessageStatusType,
  PosBusInviteMessageType,
  PosBusBroadcastMessageType,
  PosBusGatheringMessageType,
  PosBusCommunicationMessageType,
  PosBusEmojiMessageType,
  PosBusMegamojiMessageType,
  PosBusFlyWithMeType,
  PosBusScreenShareMessageType,
  PosBusMiroStateMessageType as PosBusAttributeMessageType,
  PosBusFlyToMeType,
  PosBusVoiceChatActionMessageType,
  PosBusVoiceChatUserMessageType
} from 'core/types';
import {appVariables} from 'api/constants';

class PosBusService {
  private static main = new PosBusService();

  private _subscribedAttributeTypeTopics: Set<string>;

  private client: Client | null = null;
  private port: MessagePort | null = null;

  public static init(token: string, userId: string) {
    console.log('PosBusService init', token, userId);

    console.log('import.meta.url', import.meta.url);
    // TODO: nicer way to import these? some webpack and/or package.json export magic?
    const workerUrl = new URL(
      '../../../../../../node_modules/@momentum-xyz/posbus-client/dist/worker.mjs',
      import.meta.url
    );
    const wasmUrl = new URL(
      '../../../../../../node_modules/@momentum-xyz/posbus-client/dist/pbc.wasm',
      import.meta.url
    );

    loadClientWorker(workerUrl, wasmUrl)
      .then((client) => {
        console.log('PosBus client loaded', client);
        this.main.client = client;
        return client.connect(`${appVariables.BE_URL}/posbus`, token, userId).then((port) => {
          this.main.port = port;
          port.onmessage = (event) => {
            console.log('PosBus message', event.data);
          };
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  static isConnected() {
    return !!(this.main.client && this.main.port);
  }

  static setWorld(worldId: string) {
    if (this.main.client && this.main.port) {
      this.main.client.teleport(worldId);
    }
  }

  public get subscribedAttributeTypeTopics(): Set<string> {
    return this._subscribedAttributeTypeTopics;
  }

  private constructor() {
    this._subscribedAttributeTypeTopics = new Set();
  }

  static subscribe(topic: string) {
    this.main._subscribedAttributeTypeTopics.add(topic);
  }

  static unsubscribe(topic: string) {
    this.main._subscribedAttributeTypeTopics.delete(topic);
  }

  static handleIncomingVibe(message: PosBusVibeMessageType) {
    const {count, type} = message;
    PosBusEventEmitter.emit('user-vibed', type, count);
  }

  static handleIncomingInvite(message: PosBusInviteMessageType) {
    const {spaceId, sender, uiTypeId, uiTypeName} = message;
    PosBusEventEmitter.emit('space-invite', spaceId, sender.id, sender.name, uiTypeId, uiTypeName);
  }

  static handleIncomingBroadcast(message: PosBusBroadcastMessageType) {
    PosBusEventEmitter.emit('broadcast', message);
  }

  static handleScreenShareStart(message: PosBusScreenShareMessageType) {
    PosBusEventEmitter.emit('screen-share', message);
  }

  static handleVoiceChatAction(message: PosBusVoiceChatActionMessageType) {
    const voiceChatActionAttributeValue = message.data.value;

    if (
      message.type !== PosBusMessageTypeEnum.ATTRIBUTE_CHANGED ||
      !voiceChatActionAttributeValue
    ) {
      return;
    }

    switch (voiceChatActionAttributeValue.action) {
      case VoiceChatActionEnum.KICK_USER:
        PosBusEventEmitter.emit('voice-chat-kick-user', voiceChatActionAttributeValue.userId);
        break;
      case VoiceChatActionEnum.MUTE_USER:
        PosBusEventEmitter.emit('voice-chat-mute-user', voiceChatActionAttributeValue.userId);
        break;
      case VoiceChatActionEnum.MUTE_ALL:
        PosBusEventEmitter.emit('voice-chat-mute-all', voiceChatActionAttributeValue.userId);
        break;
    }
  }

  static handleVoiceChatUser(message: PosBusVoiceChatUserMessageType) {
    const userId = message.data.value?.userId;

    if (!userId || message.type !== PosBusMessageTypeEnum.ATTRIBUTE_CHANGED) {
      return;
    }

    if (message.data.value?.joined === true) {
      PosBusEventEmitter.emit('voice-chat-user-joined', userId);
    } else if (message.data.value?.joined === false) {
      PosBusEventEmitter.emit('voice-chat-user-left', userId);
    }
  }

  static handleIncomingCommunication(message: PosBusCommunicationMessageType) {
    switch (message.action) {
      case 'kick':
        PosBusEventEmitter.emit('meeting-kick', message.spaceId);
        break;
      case 'mute':
        PosBusEventEmitter.emit('meeting-mute');
        break;
      case 'mute-all':
        PosBusEventEmitter.emit('meeting-mute-all', message.moderatorId);
        break;
      default:
    }
  }

  static handleIncomingStageMode(message: any) {
    console.log(message);
  }

  static handleIncomingHigh5(message: PosBusHigh5MessageType) {
    PosBusEventEmitter.emit('high-five', message.senderId, message.message);
  }

  static handleIncomingEmoji(message: PosBusEmojiMessageType) {
    PosBusEventEmitter.emit('emoji', message);
  }

  static handleIncomingMegamoji(message: PosBusMegamojiMessageType) {
    PosBusEventEmitter.emit('megamoji', message.url);
  }

  static handleNotifyGathering(message: PosBusGatheringMessageType) {
    PosBusEventEmitter.emit('notify-gathering-start', message);
  }

  static handlePosBusMessage(message: PosBusMessageStatusType) {
    switch (message.status) {
      case 'connected':
        PosBusEventEmitter.emit('posbus-connected');
        break;
      case 'disconnected':
        PosBusEventEmitter.emit('posbus-disconnected');
        break;
      default:
        console.warn('Unknown posbus status', message.status);
    }
  }

  static handleFlyToMeMessage(message: PosBusFlyToMeType) {
    PosBusEventEmitter.emit('fly-to-me', message.spaceId, message.pilot, message.pilot_name);
  }

  static handleStartFlyWithMeMessage(message: PosBusFlyWithMeType) {
    PosBusEventEmitter.emit('start-fly-with-me', message.spaceId, message.pilot, message.pilotName);
  }

  static handleStopFlyWithMeMessage(message: PosBusFlyWithMeType) {
    PosBusEventEmitter.emit('stop-fly-with-me', message.spaceId, message.pilot, message.pilotName);
  }

  static handleSpaceAttributeMessage(target: string, message: PosBusAttributeMessageType) {
    switch (message.type) {
      case PosBusMessageTypeEnum.ATTRIBUTE_CHANGED:
        PosBusEventEmitter.emit(
          'space-attribute-changed',
          target,
          message.data.attribute_name,
          message.data.value as AttributeValueInterface
        );
        break;
      case PosBusMessageTypeEnum.ATTRIBUTE_REMOVED:
        PosBusEventEmitter.emit('space-attribute-removed', target, message.data.attribute_name);
        break;
      case PosBusMessageTypeEnum.SUB_ATTRIBUTE_CHANGED:
        if (!message.data.sub_name) {
          return;
        }
        PosBusEventEmitter.emit(
          'space-attribute-item-changed',
          target,
          message.data.attribute_name,
          message.data.sub_name,
          message.data.value
        );
        break;
      case PosBusMessageTypeEnum.SUB_ATTRIBUTE_REMOVED:
        if (!message.data.sub_name) {
          return;
        }
        PosBusEventEmitter.emit(
          'space-attribute-item-removed',
          target,
          message.data.attribute_name,
          message.data.sub_name
        );
        break;
    }
  }

  static handleRelayMessage(target: string, message: unknown): void {
    console.log('[unity message]:', target, message);

    if (this.main.subscribedAttributeTypeTopics.has(target)) {
      this.handleSpaceAttributeMessage(target, message as PosBusAttributeMessageType);
      return;
    }

    // TODO: Old stuff, refactor to new controller attributes system
    switch (target) {
      case 'notify-gathering-start':
        this.handleNotifyGathering(message as PosBusGatheringMessageType);
        break;
      case 'vibe':
        this.handleIncomingVibe(message as PosBusVibeMessageType);
        break;
      case 'invite':
        this.handleIncomingInvite(message as PosBusInviteMessageType);
        break;
      case 'meeting':
        this.handleIncomingCommunication(message as PosBusCommunicationMessageType);
        break;
      case 'broadcast':
        this.handleIncomingBroadcast(message as PosBusBroadcastMessageType);
        break;
      case 'stage':
        this.handleIncomingStageMode(message);
        break;
      case 'high5':
        this.handleIncomingHigh5(message as PosBusHigh5MessageType);
        break;
      case 'emoji':
        this.handleIncomingEmoji(message as PosBusEmojiMessageType);
        break;
      case 'megamoji':
        this.handleIncomingMegamoji(message as PosBusMegamojiMessageType);
        break;
      case 'posbus':
        this.handlePosBusMessage(message as PosBusMessageStatusType);
        break;
      case 'fly-to-me':
        this.handleFlyToMeMessage(message as PosBusFlyToMeType);
        break;
      case 'start-fly-with-me':
        this.handleStartFlyWithMeMessage(message as PosBusFlyWithMeType);
        break;
      case 'stop-fly-with-me':
        this.handleStopFlyWithMeMessage(message as PosBusFlyWithMeType);
        break;
      case 'screen-share':
        this.handleScreenShareStart(message as PosBusScreenShareMessageType);
        break;
      case 'voice-chat-action':
        this.handleVoiceChatAction(message as PosBusVoiceChatActionMessageType);
        break;
      case 'voice-chat-user':
        this.handleVoiceChatUser(message as PosBusVoiceChatUserMessageType);
        break;
      default:
        console.debug('Unknown relay message type', target);
    }
  }

  static handleSimpleNotification(kind: PosBusNotificationEnum, flag: number, message: string) {
    console.log('[unity simple message]:', kind, flag, message);
    if (kind === PosBusNotificationEnum.TextMessage) {
      PosBusEventEmitter.emit('simple-notification', message);
    } else if (kind === PosBusNotificationEnum.HighFive) {
      PosBusEventEmitter.emit('high-five-sent', message);
    }
  }
}

export default PosBusService;
