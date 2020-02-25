import { Box3, Vector3 } from 'three';

export class Prop {
  constructor(object, position) {
    this.object = object.clone();
    this.type = 'prop';
    this.object.castShadow = true;
    this.object.position.copy(position);
    this.object.scale.set(0.7, 0.7, 0.7);
    this.object.position.y = -5.5;
    this.bBox = new Box3().setFromObject(this.object);
    this.size = new Vector3();
    this.bBox.getSize(this.size);
  }

  addToWorld(world) {
    const pos = this.object.position;
    const rot = this.object.rotation;
    this.worldObj = world.add({
      size: [this.size.x, this.size.y, this.size.z], // size of shape
      pos: [pos.x, pos.y, pos.z], // start position in degree
      rot: [rot.x, rot.y, rot.z], // start rotation in degree
      density: 1,
      move: false
    });
  }

  update(deltaTime) {
    this.object.position.copy(this.worldObj.getPosition());
    this.object.position.y += this.object.position.y * 0.05;
    this.bBox = new Box3().setFromObject(this.object);
  }
}
