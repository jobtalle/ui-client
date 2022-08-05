import React, {useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';

import {ReactComponent as AstronautIcon} from 'images/icons/professions-man-astronaut.svg';
import {ReactComponent as MicOff} from 'images/icons/microphone-off.svg';
import Avatar from 'component/atoms/Avatar';
import {useStore} from 'shared/hooks';

const LocalParticipant: React.FC = () => {
  const videoRef = useRef<HTMLDivElement>(null);
  const [hasCameraState, setHasCameraState] = useState(false);
  const {
    sessionStore: {profile},
    mainStore: {agoraStore}
  } = useStore();
  const {userDevicesStore} = agoraStore;

  useEffect(() => {
    if (userDevicesStore.localVideoTrack) {
      setHasCameraState(true);
    } else {
      setHasCameraState(false);
    }
  }, [userDevicesStore.localVideoTrack]);

  useEffect(() => {
    if (agoraStore.isStageMode) {
      if (userDevicesStore.localVideoTrack?.isPlaying) {
        userDevicesStore.localVideoTrack?.stop();
      }
      return;
    }

    if (!hasCameraState) {
      return;
    }

    if (userDevicesStore.cameraOff) {
      userDevicesStore.localVideoTrack?.stop();
    } else if (videoRef.current) {
      userDevicesStore.localVideoTrack?.play(videoRef.current);
    }
  }, [
    agoraStore.isStageMode,
    hasCameraState,
    userDevicesStore.cameraOff,
    userDevicesStore.localVideoTrack
  ]);

  return (
    <>
      <li
        className={` mb-.5 p-.5
      relative
      rounded-full 
      border-1
      ${
        agoraStore.localSoundLevel > 3 && !userDevicesStore.muted
          ? ' border-prime-blue-70'
          : ' border-transparant'
      }`}
        id="thisisyou"
      >
        {!userDevicesStore.cameraOff && hasCameraState && !agoraStore.isStageMode ? (
          <div
            className={`h-8 w-8 rounded-full bg-dark-blue-100 overflow-hidden relative border-2  
        ${
          agoraStore.localSoundLevel > 3 && !userDevicesStore.muted
            ? ' border-prime-blue-100'
            : ' border-transparant'
        }`}
            ref={videoRef}
            key="cameraOn"
          >
            <div className="h-full w-full absolute bg-dark-blue-100 text-green-light-100  flex justify-center items-center">
              <AstronautIcon className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div
            key="cameraOff"
            className={`h-8 w-8 rounded-full bg-dark-blue-100 overflow-hidden relative border-2  
          ${
            agoraStore.localSoundLevel > 3 && !userDevicesStore.muted
              ? ' border-prime-blue-100'
              : ' border-transparant'
          }`}
          >
            <div className="h-full w-full absolute bg-dark-blue-100 text-green-light-100  flex justify-center items-center">
              {profile?.profile?.avatarHash ? (
                <Avatar avatarHash={profile?.profile?.avatarHash} />
              ) : (
                <AstronautIcon className="w-4 h-4" />
              )}
            </div>
          </div>
        )}
        {userDevicesStore.muted && !agoraStore.isStageMode && (
          <MicOff className="absolute inset-x-0 w-full bottom-.5 block  text-center h-1.5" />
        )}
      </li>
      <p
        className="uppercase h-2 w-8 overflow-hidden text-center"
        style={{textOverflow: 'ellipsis', width: '92px'}}
      >
        You
      </p>
    </>
  );
};

export default observer(LocalParticipant);
