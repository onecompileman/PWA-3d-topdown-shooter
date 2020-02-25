import * as Three from 'three';
import { ModelManager } from './model-manager';
import * as Oimo from 'oimo';
import Swal from 'sweetalert2';
import { findIndex } from 'lodash';
import { Player } from './game-objects/player';
import { Platform } from './game-objects/platform';
import { Prop } from './game-objects/prop';
import { Vector3 } from 'three';
import { WeaponPickUp } from './game-objects/weapon-pick-up';
import { WeaponManager } from './game-objects/weapons/weapon-manager';
import { Enemy } from './game-objects/weapons/enemy';
import { ScreenManager } from './screen-manager';
import { AudioManager } from './audio-manager';
import { detectMobile } from './utils/mobile-detect';

export class GameManager {
  async initGame() {
    this.screenManager = new ScreenManager();
    await this.loadAllAssets();
    this.screenManager.hideAllScreen();
    this.screenManager.showScreen('gameMenu');
    this.isPlaying = false;
    this.screenManager.screens.gameMenu.onPlayCallback = () => {
      this.screenManager.hideAllScreen();
      this.screenManager.showScreen('gameTopBar');
      if (detectMobile) {
        this.screenManager.showControls();
      }
      this.isPlaying = true;
      this.play();
      this.render();
    };
  }

  play() {
    this.initGameTopBar();
    this.initWorld();
    this.initScene();
    this.initCamera();
    this.initLights();
    this.initEventListeners();
    this.initPlatform();
    this.initBuildings();
    this.initWeaponManager();
    this.addCharacter();
    this.initRenderer();
    this.initWeapons();
    this.initPointLights();
    this.initRaycaster();
    this.initGameIncreaseDifficulty();
    this.initEnemies();
    // Reset some variables
    this.score = 0;

    // Play Background music
    this.audioManager.playAudio('background', 0.6, true);
    this.bullets = [];
  }

  initGameTopBar() {
    this.gameTopBar = this.screenManager.screens.gameTopBar;
    this.gameTopBar.onPlayCallback = () => {
      this.isPlaying = true;
    };
    this.gameTopBar.onPauseCallback = () => {
      this.isPlaying = false;
    };
  }

  async loadAllAssets() {
    this.appLoader = this.screenManager.screens.appLoader;
    this.appLoader.loadingText = 'Loading 3d Models';
    await this.initModelManager(this.appLoader);
    this.appLoader.loadingText = 'Loading Sound Assets';
    await this.initAudioManager(this.appLoader);
  }

  async initAudioManager(appLoader) {
    this.audioManager = new AudioManager();
    await this.audioManager.loadAllAudio(appLoader);
  }

  async initModelManager(appLoader) {
    this.modelManager = new ModelManager(appLoader);
    await this.modelManager.loadAllModels(appLoader);
  }

  initEnemies() {
    const initialEnemyCount = 5;
    this.enemies = [];
    for (let i = 0; i < initialEnemyCount; i++) {
      this.generateEnemy();
    }

    this.initEnemyGenerator();
  }

  initWeaponManager() {
    this.weaponManager = new WeaponManager(this.scene);
  }

  initGameIncreaseDifficulty() {
    const increaseDifficultySeconds = 100;
    const increaseEnemySpeed = 0.01;
    const increaseEnemyGeneration = 10;
    const increaseEnemyLife = 10;

    this.enemyLife = 100;
    this.enemyGeneration = 5000;
    this.enemyLife = 80;
    this.enemySpeed = 0.015;
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
    }
    this.gameInterval = setInterval(() => {
      this.enemyLife += increaseEnemyLife;
      this.enemySpeed += increaseEnemySpeed;
      this.enemyGeneration += increaseEnemyGeneration;
    }, increaseDifficultySeconds * 1000);
  }

  initEnemyGenerator() {
    if (this.enemyGeneratorInterval) {
      clearInterval(this.enemyGeneratorInterval);
    }

    this.enemyGeneratorInterval = setInterval(
      () => this.generateEnemy(),
      this.enemyGeneration
    );
  }

  generateEnemy() {
    let intersects = false;
    const { scene, animations } = this.modelManager.enemies[0];
    let enemy;
    do {
      const enemyPosition = new Three.Vector3(
        this.getRandomInt(-13, 13),
        -5,
        this.getRandomInt(-13, 13)
      );

      enemy = new Enemy(
        scene,
        animations,
        enemyPosition,
        this.enemySpeed,
        this.enemyLife
      );
      const enemyBBox = enemy.bBox.clone().expandByScalar(3);
      // Check for intersections in the bounding box
      intersects = this.buildings.some(building =>
        building.bBox.intersectsBox(enemyBBox)
      );
      intersects = enemyBBox.intersectsBox(this.player.bBox);
      intersects = this.enemies.some(e => e.bBox.intersectsBox(enemyBBox));
    } while (intersects);
    enemy.onDeathListener = enemy => this.onEnemyDeath(enemy);
    enemy.addToWorld(this.world);
    this.scene.add(enemy.object);
    this.enemies.push(enemy);
  }

  initRaycaster() {
    this.raycaster = new Three.Raycaster();
    this.mouse = new Three.Vector2();
    this.intersectPoint = new Three.Vector3();

    addEventListener('mousemove', event => {
      this.mouse.x = (event.clientX / innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / innerHeight) * 2 + 1;
      // console.log(this.mouse);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      this.raycaster.ray.intersectBox(
        new Three.Box3().setFromObject(this.platform.object),
        this.intersectPoint
      );
    });
  }

  initScene() {
    this.clock = new Three.Clock();
    this.scene = new Three.Scene();
  }

  initCamera() {
    this.camera = new Three.PerspectiveCamera(
      75,
      innerWidth / innerHeight,
      0.1,
      1000
    );
    this.camera.rotation.x = -(Math.PI / 3);
    this.camera.position.set(0, -2, 3);
    this.audioManager.addListenerToCamera(this.camera);
  }

  onEnemyDeath(enemy) {
    const index = findIndex(this.enemies, { object: { uuid: enemy.uuid } });
    this.scene.remove(enemy);
    this.enemies.splice(index, 1);
    this.score++;
  }

  updateEnemies(deltaTime) {
    this.enemies.forEach(enemy => {
      enemy.follow(this.player.object);
      enemy.attack(this.player);
      enemy.update(deltaTime);
    });
  }

  onGameOver() {
    this.isPlaying = false;
    this.audioManager.stopAllAudio();
    this.screenManager.hideControls();
    cancelAnimationFrame(this.requestId);
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
    this.scene.dispose();
    this.renderer.renderLists.dispose();
    this.world.clear();
    Swal.fire({
      title: 'Game Over!',
      html:
        '<p>Game Created by: <a href="https://onecompileman.com">Stephen Vinuya</a></p>',
      confirmButtonText: 'Continue'
    }).then(() => {
      this.screenManager.hideAllScreen();
      this.screenManager.showScreen('gameMenu');
    });
  }

  initWeapons() {
    this.weapons = Array(20)
      .fill(1)
      .map(() => {
        const { object, type, damage } = this.getRandomItem(
          this.modelManager.weapons
        );
        const weapon = new WeaponPickUp(object.scene, type, damage);
        weapon.object.position.set(
          this.getRandomInt(-13, 13),
          -5.2,
          this.getRandomInt(-13, 13)
        );
        this.scene.add(weapon.object);
        return weapon;
      });
  }

  getPlayerWeaponPickup() {
    const playerSize = this.player.size.clone();
    const playerPos = this.player.object.position.clone();
    for (let weaponPickUp of this.weapons) {
      const weaponPickUpSize = weaponPickUp.size.clone();
      const weaponPickUpPos = weaponPickUp.object.position.clone();
      if (
        playerPos.distanceTo(weaponPickUpPos) <
        playerSize.x + weaponPickUpSize.x
      ) {
        return weaponPickUp;
      }
    }

    return null;
  }

  initLights() {
    this.ambientLight = new Three.AmbientLight(0xffffff, 0.1);
    this.directionalLight = new Three.DirectionalLight(0xffffff, 0.1);
    this.directionalLight.castShadow = true;

    this.scene.add(this.ambientLight);
    this.scene.add(this.directionalLight);
  }

  initRenderer() {
    const canvas = document.querySelector('#mainCanvas');
    this.renderer = new Three.WebGLRenderer({ canvas });
    this.renderer.setClearColor(0x404040);
    this.renderer.outputEncoding = Three.sRGBEncoding;
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 2.2;
    this.renderer.shadowMap.enabled = true;
  }

  render() {
    this.requestId = requestAnimationFrame(() => {
      this.render();
    });
    if (this.isPlaying) {
      const deltaTime = this.clock.getDelta();
      this.updatePlayer(deltaTime);
      this.updateCamera();
      this.updateWeapons(deltaTime);
      this.updateEnemies(deltaTime);
      this.updateBuildings(deltaTime);
      this.updateBullets(deltaTime * 20);
      // Update top bar
      this.gameTopBar.score = this.score;
      this.gameTopBar.life = this.player.life;
      // Check if game over
      if (this.player.isDead()) {
        this.onGameOver();
      }

      this.world.step();
      this.renderer.render(this.scene, this.camera);
    }
  }

  updateWeapons(deltaTime) {
    this.weapons.forEach(weapon => weapon.update(deltaTime));
  }

  updateBuildings(deltaTime) {
    this.buildings.forEach(building => building.update(deltaTime));
  }

  updateCamera() {
    this.camera.position.x = this.player.object.position.x;
    this.camera.position.z = this.player.object.position.z + 2;
  }

  updatePlayer(deltaTime) {
    if (detectMobile()) {
      this.mobilePlayerFire();
      this.mobilePlayerMove();
    }
    this.player.setWeaponForPickup(this.getPlayerWeaponPickup());
    this.player.update(deltaTime * 2, this.intersectPoint);
  }

  mobilePlayerFire() {
    const { velocity, angle } = this.screenManager.controls.right.prop;
    if (velocity.length() > 0) {
      this.player.mobileFire();
      this.player.mobileFireAngle = angle;
      this.player.mobileFireVelocity = velocity.clone();
    } else {
      this.player.stopFire();
    }
  }

  mobilePlayerMove() {
    const { velocity, angle } = this.screenManager.controls.left.prop;
    this.player.setVelocity(velocity.clone());

    if (velocity.length()) {
      this.player.setAngle(angle);
    }
  }

  initWorld() {
    this.world = new Oimo.World({
      timestep: 1 / 60,
      iterations: 8,
      broadphase: 2, // 1 brute force, 2 sweep and prune, 3 volume tree
      worldscale: 1, // scale full world
      random: true, // randomize sample
      info: false, // calculate statistic or not
      gravity: [0, -9.8, 0]
    });
  }

  initEventListeners() {
    this.listenToWindowResize();
  }

  listenToWindowResize() {
    addEventListener('resize', () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  initPlatform() {
    this.platform = new Platform();
    this.platform.addToWorld(this.world);
    this.scene.add(this.platform.object);
  }

  initPointLights() {
    for (let i = 0; i < 15; i++) {
      const lightColor = this.getRandomItem([0x52c5ee, 0xa300ff]);
      const light = new Three.PointLight(lightColor, 1, 5);
      light.position.set(
        this.getRand(-13, 13, 2),
        -5,
        this.getRand(-13, 13, 2)
      );
      this.scene.add(light);
    }
  }

  getRand(min, max, decimalPlaces) {
    const rand =
      Math.random() < 0.5
        ? (1 - Math.random()) * (max - min) + min
        : Math.random() * (max - min) + min; // could be min or max or anything in between
    const power = Math.pow(10, decimalPlaces);
    return Math.floor(rand * power) / power;
  }

  initBuildings() {
    this.buildings = [];
    for (let i = 0; i < 55; i++) {
      let collides = false;
      let building;
      do {
        const position = new Vector3(
          this.getRand(-13, 13, 2),
          0,
          this.getRand(-13, 13, 2)
        );
        const object = this.getRandomItem(this.modelManager.buildings).scene;
        building = new Prop(object, position);
        collides = !this.buildings.length
          ? false
          : this.buildings.some(b => {
              const o = b.object.clone();
              o.scale.set(1.2, 1.2, 1.2);
              const box = new Three.Box3().setFromObject(o);
              return box.intersectsBox(building.bBox);
            });
      } while (collides);

      building.addToWorld(this.world);
      this.scene.add(building.object);
      this.buildings.push(building);
    }
  }

  updateBullets(deltaTime) {
    this.bullets.forEach(bullet => {
      bullet.update(deltaTime);
      bullet.checkCollision([...this.buildings, ...this.enemies]);
    });
  }

  getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  addCharacter() {
    this.modelManager.characters.wizard.scene.position.set(0, 0, 0);
    const { scene, animations } = this.modelManager.characters.wizard;
    this.player = new Player(scene, animations, this.weaponManager);
    this.player.playClip('CharacterArmature|Idle');
    this.player.addToWorld(this.world);
    this.player.onWeaponPickUpListener = object => {
      const index = findIndex(this.weapons, { object: { uuid: object.uuid } });
      this.weapons.splice(index, 1);
    };

    this.player.onFireWeaponListener = bullet => {
      if (bullet) {
        this.bullets.push(bullet);
        bullet.onRemoveListener = bullet => {
          this.onRemoveBullet(bullet);
        };
        bullet.onCollisionListener = gameObject => {
          this.onCollisionBullet(bullet, gameObject);
        };

        this.scene.add(bullet.object);
        this.audioManager.playAudio('fire');
      }
    };

    this.directionalLight.target = this.player.object;
    this.scene.add(this.player.object);
  }

  onRemoveBullet(bullet) {
    const index = findIndex(this.bullets, {
      object: { uuid: bullet.uuid }
    });
    this.bullets.splice(index, 1);
    this.scene.remove(bullet);
  }

  onCollisionBullet(bullet, gameObject) {
    if (gameObject instanceof Enemy) {
      gameObject.life -= 10;
      gameObject.worldObj.position.add(
        bullet.velocity.normalize().multiplyScalar(0.045)
      );
    }
  }
}
