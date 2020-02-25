import { Vector3, Box3 } from 'three';

export class WeaponPickUp {
  constructor(object, type, damage) {
    this.object = object.clone();
    this.type = type;
    this.damage = damage;
    this.object.scale.set(0.1, 0.1, 0.1);
    this.size = new Vector3();
    new Box3().setFromObject(this.object).getSize(this.size);
  }

  update(deltaTime) {
    this.object.rotation.y += 2 * deltaTime;
  }
}
