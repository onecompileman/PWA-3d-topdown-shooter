import { WeaponType } from '../../enums/weapon-type';
import { Rifle } from './rifle';

export class WeaponManager {
  constructor(scene) {
    this.scene = scene;
  }

  createWeapon(object, type, damage) {
    switch (type) {
      case WeaponType.RIFLE:
        const rifle = new Rifle(object, type, damage);
        this.scene.remove(object);
        this.scene.add(rifle.object);
        return rifle;
    }
  }
}
