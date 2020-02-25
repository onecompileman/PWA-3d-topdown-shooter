import { Mesh, MeshBasicMaterial, Box3, Vector3, BoxGeometry } from 'three';

export class RifleBullet {
  constructor(position, velocity) {
    const geometry = new BoxGeometry(0.02, 0.02, 0.02);
    const material = new MeshBasicMaterial({
      color: 0xfde366
    });
    this.object = new Mesh(geometry, material);
    this.object.position.copy(position.clone());
    this.bBox = new Box3().setFromObject(this.object);
    this.size = new Vector3();
    this.bBox.getSize(this.size);
    this.object.position.y += 0.18;
    this.speed = 0.4;
    this.travelled = 0;
    this.maxTravelled = 20;
    this.velocity = velocity;
    this.velocity.normalize().multiplyScalar(-this.speed);

    this.onRemoveListener = null;
    this.onCollisionListener = null;
  }

  update(deltaTime) {
    this.object.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    this.bBox = new Box3().setFromObject(this.object);

    this.travelled += this.speed;
    if (this.travelled >= this.maxTravelled) {
      this.onRemoveListener(this.object);
    }
  }

  checkCollision(gameObjects) {
    gameObjects.some(gameObject => {
      if (this.bBox.intersectsBox(gameObject.bBox)) {
        this.onCollisionListener(gameObject);
        this.onRemoveListener(this.object);
        return true;
      }
      return false;
    });
  }
}
