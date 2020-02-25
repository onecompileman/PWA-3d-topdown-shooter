import { Vector3 } from 'three';
import { RifleBullet } from './rifle-bullet';

export class Rifle {
  constructor(object, type, damage) {
    this.object = object.clone();
    this.type = type;
    this.damage = damage;
    this.speed = 100;
    this.cooldown = true;
    this.object.rotation.set(Math.PI / 2, -0.17, 0);
    this.object.scale.set(0.004, 0.004, 0.004);
  }

  update() {}

  fire(initialPosition, velocity) {
    // this.
    if (this.cooldown) {
      this.cooldown = false;
      setTimeout(() => {
        this.cooldown = true;
      }, this.speed);
      const position = new Vector3();
      this.object.getWorldPosition(position);
      return new RifleBullet(position, velocity);
    }
    return null;
  }
}
