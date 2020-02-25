import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as Three from 'three';
import { Props } from './data/props';
import { Weapons } from './data/weapons';

export class ModelManager {
  constructor() {
    this.gltfLoader = new GLTFLoader();
  }

  async loadAllModels(appLoader) {
    await this.loadAllCharacters(appLoader);
  }

  async loadAllCharacters(appLoader) {
    appLoader.assetsCount = 2 + Props.length + Weapons.length;
    const basePath = 'assets/models/';
    const wizard = await this.loadAsset(basePath + 'wizard.glb');
    appLoader.assetsLoaded++;
    const skeleton = await this.loadAsset(basePath + 'skeleton.glb');
    appLoader.assetsLoaded++;
    this.enemies = [skeleton];
    this.characters = {
      wizard
    };
    this.buildings = [];
    for (let prop of Props) {
      const building = await this.loadAsset(basePath + prop);
      appLoader.assetsLoaded++;
      this.buildings.push(building);
    }
    this.weapons = [];
    for (let weapon of Weapons) {
      const weaponPickUp = await this.loadAsset(basePath + weapon.modelPath);
      appLoader.assetsLoaded++;

      this.weapons.push({
        type: weapon.type,
        damage: weapon.damage,
        object: weaponPickUp
      });
    }
  }

  async loadAsset(modelPath) {
    const object = await this.loadOBJ(modelPath);
    object.scene.position.set(0, 0, -1);

    return object;
  }

  loadOBJ(objPath) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        objPath,
        object => {
          object.scene.castShadow = true;

          object.scene.traverse(function(child) {
            if (child.isMesh) {
              child.material.metalness = 0;
              child.material.roughness = 0;
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          return resolve(object);
        },
        () => {},
        error => {
          return reject(error);
        }
      );
    });
  }
}
