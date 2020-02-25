import * as Three from 'three';

export class WeaponPickUp {
  constructor(object, type, damage) {
    this.object = object.clone();
    this.type = type;
    this.damage = damage;
    this.object.scale.set(0.1, 0.1, 0.1);
    this.size = new Three.Vector3();
    new Three.Box3().setFromObject(this.object).getSize(this.size);
  }

  update(deltaTime) {
    this.object.rotation.y += 2 * deltaTime;
  }
}
