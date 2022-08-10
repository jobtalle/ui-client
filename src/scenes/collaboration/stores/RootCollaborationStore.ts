import {flow, types} from 'mobx-state-tree';

import {
  Space,
  ResetModel,
  RequestModel,
  DialogModel,
  AgoraRemoteUser,
  AgoraRemoteUserInterface
} from 'core/models';
import {PrivateSpaceError} from 'core/errors';
import {api} from 'api';

import {CalendarStore} from './CalendarStore';
import {MiroBoardStore} from './MiroBoardStore';
import {DashboardStore} from './DashboardStore';
import {GoogleDriveStore} from './GoogleDriveStore';
import {ScreenShareStore} from './ScreenShareStore';
import {StageModeStore} from './StageModeStore';

const RootCollaborationStore = types
  .compose(
    ResetModel,
    types.model('RootCollaborationStore', {
      space: types.maybe(Space),
      dashboardStore: types.optional(DashboardStore, {}),
      calendarStore: types.optional(CalendarStore, {}),
      screenShareStore: types.optional(ScreenShareStore, {}),
      miroBoardStore: types.optional(MiroBoardStore, {}),
      googleDriveStore: types.optional(GoogleDriveStore, {}),
      stageModeStore: types.optional(StageModeStore, {}),
      isModerator: false,

      leftMeetingSpaceId: types.maybe(types.string),
      leftMeetingSpaceWasAGrabbedTable: types.maybe(types.boolean),
      participantToRemoveFromStage: types.maybe(AgoraRemoteUser),

      // Requests
      joinMeetingSpaceRequest: types.optional(RequestModel, {}),
      moderationRequest: types.optional(RequestModel, {}),

      // Dialogs
      newDeviceDialog: types.optional(DialogModel, {}),
      removeParticipantFromStageDialog: types.optional(DialogModel, {}),
      acceptedToJoinStageDialog: types.optional(DialogModel, {}),
      declinedToJoinStageDialog: types.optional(DialogModel, {}),
      invitedOnStageDialog: types.optional(DialogModel, {}),
      inviteOnStageDialog: types.optional(DialogModel, {}),
      kickUserFromStageDialog: types.optional(DialogModel, {}),
      prepareOnStageDialog: types.optional(DialogModel, {}),
      countdownDialog: types.optional(DialogModel, {})
    })
  )
  .volatile(() => ({
    leftMeetingTimer: setTimeout(() => {}, 0)
  }))
  .actions((self) => ({
    resetLeftMeetingSpace() {
      self.leftMeetingSpaceId = undefined;
      self.leftMeetingSpaceWasAGrabbedTable = undefined;
    }
  }))
  .actions((self) => ({
    joinMeetingSpace: flow(function* (spaceId: string, isTable = false) {
      self.resetLeftMeetingSpace();
      clearTimeout(self.leftMeetingTimer);

      self.space = Space.create({id: spaceId, isTable});

      if (!(yield self.space?.canUserJoin(spaceId))) {
        throw new PrivateSpaceError();
      }

      yield self.space.fetchSpaceInformation();

      if (!isTable) {
        yield self.dashboardStore.fetchDashboard(spaceId);
      }

      const isModerator: boolean = yield self.moderationRequest.send(
        api.spaceIntegrationsRepository.checkSpaceModeration,
        {spaceId}
      );

      self.isModerator = isModerator;
    }),
    leaveMeetingSpace() {
      self.leftMeetingSpaceId = self.space?.id;
      self.leftMeetingSpaceWasAGrabbedTable = self.space?.isTable;

      if (!!self.space && self.space.isAdmin) {
        self.miroBoardStore.disableMiroBoard(self.space.id);
        self.googleDriveStore.disableGoogleDocument(self.space.id);
      }

      self.space = undefined;
      self.isModerator = false;

      self.leftMeetingTimer = setTimeout(() => {
        self.resetLeftMeetingSpace();
      }, 15000);
    },
    selectUserToRemoveAndOpenDialog(remoteUser: AgoraRemoteUserInterface) {
      self.participantToRemoveFromStage = remoteUser;
      self.removeParticipantFromStageDialog.open();
    },
    unselectUserToRemoveAndCloseDialog() {
      self.participantToRemoveFromStage = undefined;
      self.removeParticipantFromStageDialog.close();
    }
  }))
  .views((self) => ({
    get isSpaceLoaded(): boolean {
      return self.space?.didFetchSpaceInformation ?? false;
    }
  }));

export {RootCollaborationStore};
