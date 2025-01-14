import {
  Scene,
  SceneLoader,
  AssetContainer,
  InstantiatedEntries,
  PBRMaterial,
  TransformNode,
  Color3,
  Nullable,
  Vector3,
  Texture
} from '@babylonjs/core';
import {Object3dInterface, Texture3dInterface, SetWorldInterface} from '@momentum-xyz/core';

import {PlayerHelper} from './PlayerHelper';
import {SkyboxHelper} from './SkyboxHelper';
import {getAssetFileName, getBoundingInfo} from './UtilityHelper';
import {posToVec3} from './TransformHelper';
import {WorldCreatorHelper} from './WorldCreatorHelper';
import './initLoaderGLTF';

interface BabylonObjectInterface {
  container: AssetContainer;
  objectDefinition: Object3dInterface;
  objectInstance: InstantiatedEntries;
}

// Textures waiting for the object to spawn.
// Map texture labels to texture metadata
type SlotTexturesType = Map<string, Texture3dInterface>;
// Nested map: objectID, then (texture) label.
type AwaitingTexturesType = Map<string, SlotTexturesType>;

export class ObjectHelper {
  static assetRootUrl = '/asset/';
  static textureRootUrl = '/texture/';
  static textureDefaultSize = 's3/';
  static objectsMap = new Map<string, BabylonObjectInterface>();
  static scene: Scene;
  static attachedNode: TransformNode;
  static transformSubscription: {unsubscribe: () => void} | undefined;
  static selectedObjectFromSpawn = '';
  static spawningMaterial: PBRMaterial;
  static mySpawningClone: Nullable<TransformNode>;
  static awaitingTexturesMap: AwaitingTexturesType = new Map();

  static initialize(scene: Scene, assetBaseURL: string): void {
    this.scene = scene;
    scene.useRightHandedSystem = true;

    this.assetRootUrl = `${assetBaseURL}/asset/`;
    this.textureRootUrl = `${assetBaseURL}/texture/`;
  }

  static setWorld(world: SetWorldInterface) {
    this.disposeAllObjects();
  }

  static async spawnObjectAsync(scene: Scene, object: Object3dInterface, attachToCam: boolean) {
    const existingObj = this.objectsMap.get(object.id);
    if (existingObj) {
      // TODO: compare/check for changes?
      this.removeObject(object.id);
    }

    const assetUrl = getAssetFileName(object.asset_3d_id);

    const container = await SceneLoader.LoadAssetContainerAsync(
      this.assetRootUrl,
      assetUrl,
      scene,
      (event) => {
        // On progress callback
        //console.log(`Loading progress ${event.loaded}/${event.total}`);
      },
      '.glb'
    );
    this.instantiateObject(container, object, attachToCam);
  }

  static objectTextureChange(scene: Scene, texture: Texture3dInterface): void {
    if (texture.label === 'skybox_custom') {
      // TODO: refactor special case for world objects.
      SkyboxHelper.set360Skybox(
        scene,
        this.textureRootUrl + SkyboxHelper.defaultSkyboxTextureSize + texture.hash
      );
      return;
    }
    // Handle textures arriving before objects are spawned.
    this.appendAwaitingTexture(texture);
    const obj = this.objectsMap.get(texture.objectId);
    if (obj) {
      this.setObjectTextures(obj, scene);
    } //else: spawnObject will check awaitingTextures
  }

  static setObjectTextures(obj: BabylonObjectInterface, scene: Scene) {
    const textures = this.popAwaitingTextures(obj.objectDefinition.id);
    if (textures) {
      for (const [label, texture] of textures) {
        this.setObjectTexture(obj, scene, label, texture);
      }
    }
  }

  static setObjectTexture(
    obj: BabylonObjectInterface,
    scene: Scene,
    label: string,
    texture: Texture3dInterface
  ): void {
    // Handle object color
    if (label === 'object_color') {
      const childMeshes = obj.objectInstance.rootNodes[0].getChildMeshes();
      const basicShapeMat = childMeshes[0].material as PBRMaterial;
      basicShapeMat.albedoColor = Color3.FromHexString(texture.hash);
    } else if (label === 'object_texture') {
      if (obj.objectDefinition.asset_format.toString() === '2') {
        const childMeshes = obj.objectInstance.rootNodes[0].getChildMeshes();
        const textureUrl = this.textureRootUrl + this.textureDefaultSize + texture.hash;
        const newTexture = new Texture(
          textureUrl,
          scene,
          undefined,
          undefined,
          undefined,
          undefined,
          (message) => {
            console.log(
              'Error when loading a texture for object id: ' +
                texture.objectId +
                ', error: ' +
                message
            );
          }
        );
        newTexture.uAng = Math.PI;

        const basicShapeMat = childMeshes[0].material as PBRMaterial;
        basicShapeMat.albedoColor = Color3.White();
        basicShapeMat.albedoTexture = newTexture;
        childMeshes[0].material = basicShapeMat;
      }
    } else {
      console.debug('Unhandled object texture label: ' + label);
    }
  }

  static instantiateObject(container: AssetContainer, object: Object3dInterface, attach: boolean) {
    const instance = container.instantiateModelsToScene();
    const node = instance.rootNodes[0];
    if (!(node instanceof TransformNode)) {
      console.log(
        'instance.rootNodes.length === 0. Something went wrong with loading ' + object.asset_3d_id
      );
      return;
    }

    node.name = object.name;

    node.position = posToVec3(object.transform.position);
    node.rotation = posToVec3(object.transform.rotation);
    node.scaling = posToVec3(object.transform.scale);
    node.metadata = object.id;

    // Play animations
    for (const group of instance.animationGroups) {
      group.play(true);
    }

    const babylonObject = {
      container: container,
      objectDefinition: object,
      objectInstance: instance
    };
    this.objectsMap.set(object.id, babylonObject);

    this.setObjectTextures(babylonObject, this.scene);

    if (attach) {
      this.attachToCamera(object.id, node);
    }
  }

  static attachToCamera(objectId: string, node: TransformNode) {
    if (this.selectedObjectFromSpawn === '') {
      this.attachedNode = node;
      node.setParent(PlayerHelper.getPlayerNode());

      console.log('node bounding box:', node.getHierarchyBoundingVectors());
      const {size} = getBoundingInfo(node);
      console.log('size:', size);

      // node.position = new Vector3(0, -0.5, -3);
      node.position = new Vector3(0, 0, -size * 2);

      this.setSpawningMaterial(node);

      this.selectedObjectFromSpawn = objectId;
      this.transformSubscription = WorldCreatorHelper.subscribeForTransformUpdates(
        objectId,
        node,
        true
      );
    }
  }

  static detachFromCamera() {
    this.transformSubscription?.unsubscribe();

    if (this.attachedNode) {
      this.attachedNode.setParent(null, undefined, true);
      const attachedNodeChildren = this.attachedNode.getChildMeshes();
      attachedNodeChildren.forEach((element) => {
        element.setEnabled(true);
      });
      this.attachedNode.setEnabled(true);
    }

    this.mySpawningClone?.dispose();
    this.selectedObjectFromSpawn = '';

    PlayerHelper.setSelfPos(new Vector3(0, -0.5, -3));
  }

  static setSpawningMaterial(node: TransformNode) {
    const myClone = node.clone('clone', PlayerHelper.playerInstance.rootNodes[0]);
    const spawningMat = new PBRMaterial('spawning', this.scene);
    spawningMat.albedoColor = Color3.Gray();
    spawningMat._reflectivityColor = Color3.Gray();
    spawningMat.alpha = 0.3;

    if (myClone) {
      const cloneChildren = myClone.getChildMeshes();
      cloneChildren.forEach((element) => {
        element.material = spawningMat;
      });
    }
    this.mySpawningClone = myClone;

    const childMeshes = node.getChildMeshes();
    childMeshes.forEach((element) => {
      element.setEnabled(false);
    });
  }

  static removeObject(id: string) {
    const objToRemove = this.objectsMap.get(id);
    if (objToRemove) {
      objToRemove.objectInstance.dispose();
      objToRemove.container.removeAllFromScene();
      objToRemove.container.dispose();

      this.objectsMap.delete(id);
    } else {
      console.log("unable to delete object, as the id doesn't exist in the map, " + id);
    }
  }

  static disposeAllObjects() {
    for (const mapObj of this.objectsMap) {
      mapObj[1]?.objectInstance.dispose();
      mapObj[1]?.container.removeFromScene();
      mapObj[1]?.container.dispose();
    }
    this.objectsMap.clear();
  }

  /** Append texture to the queue waiting for the object to spawn. */
  static appendAwaitingTexture(texture: Texture3dInterface): void {
    const objectID = texture.objectId;
    let current = this.awaitingTexturesMap.get(objectID);
    if (!current) {
      current = new Map();
      this.awaitingTexturesMap.set(objectID, current);
    }
    current.set(texture.label, texture);
  }

  /** Pop entry from the queue with waiting textures. */
  static popAwaitingTextures(objectID: string): SlotTexturesType | undefined {
    // pff, why is map.pop not available by default...
    const current = this.awaitingTexturesMap.get(objectID);
    if (current) {
      this.awaitingTexturesMap.delete(objectID);
    }
    return current;
  }
}
