import {
  Box3,
  Vector3,
  Vector2,
  AnimationMixer,
  AnimationClip,
  Group
} from 'three';
import { detectMobile } from '../utils/mobile-detect';

export class Player {
  constructor(object, animations, weaponManager) {
    this.object = object;
    this.clips = animations;
    this.clips[9].tracks = this.clips[9].tracks.filter(
      track => !track.name.includes('ArmR')
    );
    this.weaponManager = weaponManager;
    this.mixer = new AnimationMixer(object);
    this.velocity = new Vector3();
    this.getPlayerRightArm();
    this.initObject();
    this.bBox = new Box3().setFromObject(this.object);
    this.size = new Vector3();
    this.bBox.getSize(this.size);
    this.state = 'idle';
    this.oldState = 'idle';
    this.action = null;
    this.mousePoint = new Vector2();
    this.isFiring = false;
    this.weapon = null;
    this.speed = 0.035;
    this.life = 100;
    this.mobileFireAngle = 0;
    this.mobileFireVelocity = null;
    this.weaponForPickup = null;
    this.onWeaponPickUpListener = null;
    this.onFireWeaponListener = null;
    this.initFireAnimation();
    this.initEventListener();
  }

  getPlayerRightArm() {
    this.playerRightArm = this.object.children[0].children[1].children[0].skeleton.bones[14];
  }

  initObject() {
    this.object.position.z = 1;
    this.object.rotation.y = Math.PI;
    this.object.scale.set(0.25, 0.25, 0.25);
    this.object.castShadow = true;
  }

  setWeaponForPickup(weaponForPickup) {
    this.weaponForPickup = weaponForPickup;
  }

  initFireAnimation() {
    const clipFire = AnimationClip.findByName(
      this.clips,
      'CharacterArmature|Shoot_OneHanded'
    );
    const clipPunch = AnimationClip.findByName(
      this.clips,
      'CharacterArmature|Punch'
    );
    this.punchAction = this.mixer.clipAction(clipPunch);
    this.fireAction = this.mixer.clipAction(clipFire);
  }

  addToWorld(world) {
    const pos = this.object.position;
    const rot = this.object.rotation;
    this.worldObj = world.add({
      type: 'box',
      size: [this.size.x, this.size.y, this.size.z],
      pos: [pos.x, pos.y, pos.z],
      rot: [rot.x, rot.y, rot.z],
      move: true,
      density: 1
    });
  }

  isDead() {
    return this.life <= 0 || this.object.position.y <= -10;
  }

  update(deltaTime, intersectPoint) {
    if (this.state !== this.oldState) {
      this.oldState = this.state;

      if (this.state === 'idle') {
        this.playClip('CharacterArmature|Idle');
      } else {
        this.playClip('CharacterArmature|Walk');
      }
    }

    this.mousePoint = new Vector2(intersectPoint.x, intersectPoint.z);

    // this.updateWeapon();
    if (this.fireAction.isRunning()) {
      this.fire();
    }
    if (!detectMobile()) {
      this.computeRotation();
    } else {
      this.computeMobileFireRotation();
    }

    this.mixer.update(deltaTime);
    // this.velocity.setLength(0.02);
    this.worldObj.position.add(
      this.velocity
        .clone()
        .normalize()
        .multiplyScalar(this.speed)
    );
    this.object.position.copy(this.worldObj.getPosition());
    this.worldObj.rotation.y = this.object.rotation.y;
    this.object.position.y += this.object.position.y * 0.05;
    this.bBox = new Box3().setFromObject(this.object);
  }

  updateWeapon() {
    if (this.weapon) {
      this.weapon.update();
    }
  }

  fire() {
    const player2dPosition = new Vector2(
      this.object.position.x,
      this.object.position.z
    );
    const desired2dVelocity = player2dPosition.sub(this.mousePoint.clone());
    const velocity = new Vector3(desired2dVelocity.x, 0, desired2dVelocity.y);

    const mobileFireVelocity3 = this.mobileFireVelocity
      ? new Vector3(this.mobileFireVelocity.x, 0, this.mobileFireVelocity.y)
      : new Vector3();
    mobileFireVelocity3.multiplyScalar(-1);
    const bullet = this.weapon.fire(
      this.object.position.clone(),
      this.mobileFireVelocity ? mobileFireVelocity3 : velocity
    );
    this.onFireWeaponListener(bullet);
  }

  initEventListener() {
    addEventListener('keydown', evt => {
      this.state = 'walk';
      if (evt.key === 'w') {
        this.velocity.z = -0.02;
      } else if (evt.key === 's') {
        this.velocity.z = 0.02;
      }
      if (evt.key === 'd') {
        this.velocity.x = 0.02;
      } else if (evt.key === 'a') {
        this.velocity.x = -0.02;
      }
    });

    addEventListener('keypress', evt => {
      if (evt.key === 'e') {
        this.pickUpWeapon();
      }
    });

    addEventListener('keyup', evt => {
      if (evt.key === 'w' || evt.key === 's') {
        this.velocity.z = 0;
      }

      if (evt.key === 'a' || evt.key === 'd') {
        this.velocity.x = 0;
      }
      if (this.velocity.z === 0 && this.velocity.x === 0) {
        this.state = 'idle';
      }
    });

    addEventListener('mousedown', () => {
      if (!this.fireAction.isRunning() && !this.punchAction.isRunning()) {
        if (this.weapon) {
          this.fireAction.play();
        } else {
          this.punchAction.play();
        }
        this.isFiring = true;
      }
    });

    addEventListener('mouseup', () => this.stopFire());
  }

  pickUpWeapon() {
    if (this.weaponForPickup) {
      const { object, type, damage } = this.weaponForPickup;
      this.onWeaponPickUpListener(object);
      this.weapon = this.weaponManager.createWeapon(object, type, damage);
      this.pivot = new Group();
      this.pivot.position.set(0.0, 0.0, 0);
      this.playerRightArm.add(this.pivot);
      this.weapon.object.position.set(0, 0, 0);
      this.pivot.add(this.weapon.object);
    }
  }

  mobileFire() {
    this.pickUpWeapon();
    if (!this.fireAction.isRunning() && !this.punchAction.isRunning()) {
      if (this.weapon) {
        this.fireAction.play();
      } else {
        this.punchAction.play();
      }
      this.isFiring = true;
    }
  }

  stopFire() {
    this.fireAction.stop();
    this.punchAction.stop();
    this.isFiring = false;
  }

  setVelocity(velocity) {
    this.velocity = new Vector3(velocity.x, 0, velocity.y);
    if (this.velocity.length() > 0) {
      this.state = 'walk';
    } else {
      this.state = 'idle';
    }
  }

  setAngle(angle) {
    this.object.rotation.y = -(angle + Math.PI / 2);
  }

  computeMobileFireRotation() {
    if (this.isFiring) {
      this.object.rotation.y = -this.mobileFireAngle + Math.PI * 2.5;
    }
  }

  computeRotation() {
    if (this.isFiring) {
      const player2dPosition = new Vector2(
        this.object.position.x,
        this.object.position.z
      );
      const angle = -(
        player2dPosition.sub(this.mousePoint).angle() +
        Math.PI / 2
      );
      this.object.rotation.y = angle;
    } else {
      if (this.velocity.z > 0 && this.velocity.x === 0) {
        this.object.rotation.y = 0;
      } else if (this.velocity.z < 0 && this.velocity.x === 0) {
        this.object.rotation.y = Math.PI;
      } else if (this.velocity.x < 0 && this.velocity.z === 0) {
        this.object.rotation.y = Math.PI * 1.5;
      } else if (this.velocity.x > 0 && this.velocity.z === 0) {
        this.object.rotation.y = Math.PI / 2;
      } else if (this.velocity.z > 0 && this.velocity.x < 0) {
        this.object.rotation.y = Math.PI * 1.75;
      } else if (this.velocity.z < 0 && this.velocity.x > 0) {
        this.object.rotation.y = Math.PI * 0.75;
      } else if (this.velocity.z < 0 && this.velocity.x < 0) {
        this.object.rotation.y = Math.PI * 1.25;
      } else if (this.velocity.z > 0 && this.velocity.z > 0) {
        this.object.rotation.y = Math.PI * 0.25;
      }
    }
  }

  playClip(name, isReset = true) {
    if (this.action) {
      this.action.stop();
    }
    const clip = AnimationClip.findByName(this.clips, name);
    this.action = this.mixer.clipAction(clip);
    this.action.play();
  }
}
