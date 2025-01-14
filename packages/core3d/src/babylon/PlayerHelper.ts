import {
  Scene,
  UniversalCamera,
  Vector3,
  Quaternion,
  SceneLoader,
  AssetContainer,
  InstantiatedEntries,
  NodeMaterial,
  Texture,
  TransformNode
} from '@babylonjs/core';
import {
  Odyssey3dUserInterface,
  Odyssey3dUserTransformInterface,
  SetWorldInterface,
  TransformNoScaleInterface
} from '@momentum-xyz/core';

import wisp from '../static/Wisp.glb';
import defaultAvatar from '../static/Rabbit.png';
import wispNodeMaterial from '../static/nodeMaterialWisp.json';

import {
  posToVec3,
  vec3ToPos,
  smoothUserNodeTransform,
  smoothCameraTransform,
  TransformTypesEnum
} from './TransformHelper';
import {ObjectHelper} from './ObjectHelper';
import {InteractionEffectHelper} from './InteractionEffectHelper';
import {InputHelper} from './InputHelper';

//const NORMAL_SPEED = 0.5;
//const FAST_SPEED = 1.5;
const PLAYER_OFFSET = new Vector3(0, -0.5, 3);
export const PLAYER_OFFSET_RH = new Vector3(0, -0.5, -3);

// TODO: Set this from PosBusSelfPosMsg
const CAMERA_POS_CREATOR = new Vector3(50, 50, 150);

interface BabylonUserInterface {
  container: AssetContainer;
  userDefinition: Odyssey3dUserInterface;
  userInstance: InstantiatedEntries;
}

const enum KeysEnum {
  LEFT = 37,
  UP = 38,
  RIGHT = 39,
  DOWN = 40,

  A = 65,
  D = 68,
  E = 69,
  Q = 81,
  S = 83,
  W = 87
}

export class PlayerHelper {
  static camera: UniversalCamera;
  static scene: Scene;
  static userMap = new Map<string, BabylonUserInterface>();

  static playerInstance: InstantiatedEntries;
  static playerContainer: AssetContainer;
  static playerAvatar3D: string;
  static playerId: string;
  static playerInterface: Odyssey3dUserInterface;
  static rightHanded = false;
  static selectedSpeed = 1;
  static onSpawnParticles: (() => void) | undefined;

  static initialize(
    scene: Scene,
    canvas: HTMLCanvasElement,
    rh: boolean,
    onMove?: (transform: TransformNoScaleInterface) => void,
    onSpawnParticles?: () => void
  ) {
    this.scene = scene;
    this.rightHanded = rh;
    this.onSpawnParticles = onSpawnParticles;
    // This creates and positions a UniversalCamera camera (non-mesh)
    const camera = new UniversalCamera('UniversalCamera', CAMERA_POS_CREATOR, scene);
    camera.rotationQuaternion = new Quaternion();
    //camera.speed = NORMAL_SPEED;
    camera.speed = this.selectedSpeed;
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // WASD controls
    camera.keysUp = [KeysEnum.W, KeysEnum.UP];
    camera.keysLeft = [KeysEnum.A, KeysEnum.LEFT];
    camera.keysDown = [KeysEnum.S, KeysEnum.DOWN];
    camera.keysRight = [KeysEnum.D, KeysEnum.RIGHT];
    camera.keysUpward = [KeysEnum.E];
    camera.keysDownward = [KeysEnum.Q];

    this.camera = camera;

    InputHelper.initializePlayerControls(scene);
    this.camera.onViewMatrixChangedObservable.add(() => {
      // TODO: Consider where to apply the offset between player and camera

      const playerTransform: TransformNoScaleInterface = {
        position: vec3ToPos(this.camera.position /*.add(PLAYER_OFFSET)*/),
        rotation: vec3ToPos(this.camera.rotation)
      };

      if (onMove) {
        onMove(playerTransform);
      }
    });
  }

  static getPlayerNode(): TransformNode | null {
    const myNode = this.playerInstance?.rootNodes[0];
    console.log('PlayerHelper getPlayerNode', myNode);
    if (myNode instanceof TransformNode) {
      return myNode;
    }
    console.log('PlayerHelper getPlayerNode: node is null or wrong type');
    return null;
  }

  static getUserNode(userId: string): TransformNode | null {
    const userObj = this.userMap.get(userId);
    if (userObj) {
      const userNode = userObj.userInstance.rootNodes[0];
      if (userNode instanceof TransformNode) {
        return userNode;
      }
    }
    console.log('PlayerHelper getUserNode: node is null or wrong type');
    return null;
  }

  static setWorld(world: SetWorldInterface, userId: string) {
    this.disposeAllUsers();
    this.playerInstance?.dispose();
    this.playerContainer?.removeAllFromScene();
    this.playerContainer?.dispose();

    this.playerAvatar3D = world.avatar_3d_asset_id;
    this.playerId = userId;
    this.spawnPlayer(PlayerHelper.scene);
  }

  static setSelfPos(pos: Vector3) {
    const node = this.getPlayerNode();
    if (!node) {
      return;
    }
    node.position = pos;
  }

  // TODO: Consider merging the different spawning functions
  static spawnPlayer(scene: Scene, position?: Vector3, target?: Vector3) {
    //const assetUrl = getAssetFileName(PlayerHelper.playerAvatar3D);
    SceneLoader.LoadAssetContainer(
      wisp, //ObjectHelper.assetRootUrl,
      '', //assetUrl,
      scene,
      (container) => {
        this.playerInstantiate(container, position, target);
      },
      //on progress
      (event) => {},
      (scene, message) => {
        // On error callback
        console.log(PlayerHelper.playerAvatar3D + ' failed loading!: ' + message);
      },
      '.glb'
    );
  }

  // TODO: Consider merging the different instantiating functions
  static playerInstantiate(container: AssetContainer, position?: Vector3, target?: Vector3) {
    const instance = container.instantiateModelsToScene();

    console.log('PlayerHelper store instance', instance, container);
    this.playerInstance = instance;
    this.playerContainer = container;

    const playerNode = this.getPlayerNode();
    if (!playerNode) {
      console.log('Unable to load player model');
      return;
    }

    // TODO: Set camera pos
    this.setUserAvatar(playerNode);

    playerNode.name = 'Player';
    playerNode.parent = this.camera;
    if (position) {
      this.camera.position = position;
    }
    if (target) {
      this.camera.target = target;
    }
    playerNode.rotation = new Vector3(0, 0, 0);
    playerNode.scaling = new Vector3(0.5, 0.5, 0.5);

    if (this.rightHanded) {
      // manually account for RH
      playerNode.scaling = new Vector3(0.5, 0.5, -0.5);
      playerNode.position = PLAYER_OFFSET_RH;
      playerNode.rotation = new Vector3(Math.PI / 16, Math.PI, Math.PI);
    } else {
      playerNode.position = PLAYER_OFFSET;
      playerNode.rotation = new Vector3(-Math.PI / 16, Math.PI, Math.PI);
    }
    // TODO: Animations

    InteractionEffectHelper.setupWispTail();
  }

  static setUserAvatar(node: TransformNode) {
    const meshes = node.getChildMeshes();
    const customNodeMat = NodeMaterial.Parse(wispNodeMaterial, this.scene);
    const textures = customNodeMat.getTextureBlocks();
    const defaultTexture = new Texture(defaultAvatar);
    textures[2].texture = defaultTexture;
    meshes[0].material = customNodeMat;
  }

  static updateUserAvatar(user: Odyssey3dUserInterface, instance: InstantiatedEntries) {
    const meshes = instance.rootNodes[0].getChildMeshes();
    const myNodeMat = meshes[0].material as NodeMaterial;
    const textureBlocks = myNodeMat.getTextureBlocks();
    let textureUrl = '';
    if (user.avatar) {
      if (user.avatar.startsWith('http')) {
        textureUrl = user.avatar;
      } else {
        textureUrl = ObjectHelper.textureRootUrl + ObjectHelper.textureDefaultSize + user.avatar;
      }

      const avatarTexture = new Texture(
        textureUrl,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        (message) => {
          console.log(
            'Error when loading a texture for user: ' + user.name + ', error: ' + message
          );
        }
      );
      textureBlocks[2].texture = avatarTexture;
    }
  }

  static async userEnteredAsync(user: Odyssey3dUserInterface) {
    await this.spawnUserAsync(this.scene, user);
  }

  // TODO: Consider merging the different spawning functions
  static async spawnUserAsync(scene: Scene, user: Odyssey3dUserInterface) {
    //const assetUrl = getAssetFileName(this.playerAvatar3D);
    await SceneLoader.LoadAssetContainerAsync(
      wisp, //ObjectHelper.assetRootUrl,
      '', //assetUrl,
      scene,
      (event) => {},
      '.glb'
    ).then((container) => {
      this.userInstantiate(container, user);
    });
  }

  static userInstantiate(container: AssetContainer, user: Odyssey3dUserInterface) {
    if (user.id === this.playerId) {
      this.playerInterface = user;
      if (this.playerInstance) {
        this.updateUserAvatar(user, this.playerInstance);
      }
      return;
    } else {
      const instance = container.instantiateModelsToScene();
      const userNode = instance.rootNodes[0];
      if (!(userNode instanceof TransformNode)) {
        console.log('Unable to instantiate user');
        return;
      }

      this.setUserAvatar(userNode);

      userNode.scaling = new Vector3(0.5, 0.5, -0.5);
      const childNodes = userNode.getChildTransformNodes();
      if (childNodes.length > 0) {
        childNodes[0].position = PLAYER_OFFSET_RH;
        childNodes[0].rotation = new Vector3(0, Math.PI, Math.PI);
      }

      userNode.name = user.name;
      if (user.transform?.position) {
        userNode.position = posToVec3(user.transform.position);
      }

      userNode.metadata = user.id;

      const babylonUser = {
        container: container,
        userDefinition: user,
        userInstance: instance
      };
      this.userMap.set(user.id, babylonUser);
      this.updateUserAvatar(user, instance);
    }
  }

  static setUserTransforms(users: Odyssey3dUserTransformInterface[]) {
    for (const user of users) {
      if (user.id === this.playerId) {
        continue;
      }
      const transformNode = this.getUserNode(user.id);

      if (!transformNode) {
        console.log('Cant set position, because the instance of user has no rootnode.');
        continue;
      }

      smoothUserNodeTransform(
        transformNode,
        transformNode.position,
        user.transform.position,
        TransformTypesEnum.Position,
        this.scene
      );

      smoothUserNodeTransform(
        transformNode,
        transformNode.rotation,
        user.transform.rotation,
        TransformTypesEnum.Rotation,
        this.scene
      );
    }
  }

  static followPlayer(idToFollow: string) {
    const userNodeToFollow = this.getUserNode(idToFollow);
    if (!userNodeToFollow) {
      console.log('Cant follow player, because the instance of user has no rootnode.');
      return;
    }
    smoothCameraTransform(
      this.camera.target,
      userNodeToFollow,
      TransformTypesEnum.Rotation,
      1000,
      this.scene
    );

    smoothCameraTransform(
      this.camera.position,
      userNodeToFollow,
      TransformTypesEnum.Position,
      2000,
      this.scene,
      true,
      true
    );
  }

  static userRemove(id: string) {
    const userToRemove = this.userMap.get(id);
    if (userToRemove) {
      userToRemove.userInstance.dispose();
      userToRemove.container.removeAllFromScene();
      userToRemove.container.dispose();

      this.userMap.delete(id);
    } else {
      console.log("unable to delete object, as the id doesn't exist in the map, " + id);
    }
  }

  static disposeAllUsers() {
    for (const mapObj of this.userMap) {
      mapObj[1].userInstance.dispose();
      mapObj[1].container.removeFromScene();
      mapObj[1].container.dispose();
    }
    this.userMap.clear();
  }
}
