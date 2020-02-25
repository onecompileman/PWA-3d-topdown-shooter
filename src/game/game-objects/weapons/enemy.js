import {
  AnimationMixer,
  AnimationClip,
  Box3,
  Vector3,
  Vector2,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Object3D,
  LoopOnce
} from 'three';
import { cloneDeep } from 'lodash';
import { cloneGltf } from '../../utils/clone-gltf';

export class Enemy {
  constructor(object, animations, position, speed, life) {
    this.object = cloneGltf(object).scene;
    this.object.scale.set(0.22, 0.22, 0.22);
    this.clips = cloneDeep(animations).map(animation => {
      animation.name = animation.name.split('_')[1];
      return animation;
    });
    this.object.position.copy(position);
    this.life = life;
    this.originalLife = life;
    this.rangeToAttack = 5;
    this.speed = speed;
    this.attackCooldown = true;
    this.velocity = new Vector3();
    this.bBox = new Box3().setFromObject(this.object);
    this.size = new Vector3();
    this.bBox.getSize(this.size);
    this.mixer = new AnimationMixer(this.object);
    this.attackAction = this.mixer.clipAction(
      AnimationClip.findByName(this.clips, 'Attack')
    );
    this.attackAction.loop = LoopOnce;
    this.playAnimation('Idle');
    this.initLife();
    this.oldState = 'Idle';
    this.state = 'Idle';
    this.onDeathListener = null;
  }

  initLife() {
    const geometry = new BoxGeometry(this.size.x * 2.5, 0.1, 0.1);
    const material = new MeshBasicMaterial({ color: 0x55ff55 });
    this.lifeMesh = new Mesh(geometry, material);
    this.lifeMeshContainer = new Object3D();
    this.lifeMeshContainer.add(this.lifeMesh);
    this.object.add(this.lifeMeshContainer);
    this.lifeMeshContainer.position.y += this.size.y * 5.2;
  }

  playAnimation(animationName) {
    const clip = AnimationClip.findByName(this.clips, animationName);
    this.action = this.mixer.clipAction(clip);
    this.action.reset().play();
  }

  update(deltaTime) {
    this.mixer.update(deltaTime);
    this.worldObj.position.add(this.velocity);
    this.object.position.copy(this.worldObj.getPosition());
    this.lifeMesh.scale.x = this.life / this.originalLife;
    this.worldObj.rotation.y = this.object.rotation.y;

    this.object.position.y += this.object.position.y * 0.1;
    this.bBox = new Box3().setFromObject(this.object);
    if (this.oldState !== this.state) {
      this.oldState = this.state;
      this.playAnimation(this.state);
    }
    if (this.life <= 0) {
      this.world.remove(this.worldObj);

      this.onDeathListener(this.object);
    }
  }

  follow(player) {
    if (
      player.position.distanceTo(this.object.position) <= this.rangeToAttack
    ) {
      const playerPosition2d = new Vector2(
        player.position.x,
        player.position.z
      );
      const enemyPosition2d = new Vector2(
        this.object.position.x,
        this.object.position.z
      );
      const velocity2d = playerPosition2d.sub(enemyPosition2d);
      this.velocity = new Vector3(velocity2d.x, 0, velocity2d.y)
        .normalize()
        .multiplyScalar(this.speed);
      this.object.rotation.y = -(velocity2d.angle() + Math.PI * 3.5);
      this.state = 'Running';
    } else {
      this.state = 'Idle';
      this.velocity.multiplyScalar(0);
    }
  }

  attack(player) {
    if (player.bBox.intersectsBox(this.bBox) && this.attackCooldown) {
      player.life -= 5;
      this.attackCooldown = false;
      this.attackAction.reset().play();
      setTimeout(() => {
        this.attackCooldown = true;
      }, 1000);
    }
  }

  addToWorld(world) {
    const pos = this.object.position;
    const rot = this.object.rotation;
    this.world = world;
    this.worldObj = world.add({
      type: 'box',
      size: [this.size.x, this.size.y, this.size.z],
      pos: [pos.x, pos.y, pos.z],
      rot: [rot.x, rot.y, rot.z],
      move: true,
      density: 1
    });
  }
}
