import { BoxGeometry, MeshLambertMaterial, Mesh } from 'three';

export class Platform {
  constructor() {
    const geometry = new BoxGeometry(30, 0.2, 30);
    const material = new MeshLambertMaterial({ color: 0x9e9892 });
    this.object = new Mesh(geometry, material);
    this.object.position.y = -6;
    this.object.receiveShadow = true;
  }

  addToWorld(world) {
    const pos = this.object.position;
    const rot = this.object.rotation;
    this.worldObj = world.add({
      size: [30, 0.2, 30], // size of shape
      pos: [pos.x, pos.y, pos.z], // start position in degree
      rot: [rot.x, rot.y, rot.z], // start rotation in degree
      density: 1
    });
  }
}
