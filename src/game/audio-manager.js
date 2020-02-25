import { AudioListener, AudioLoader, Audio } from 'three';
import { Sounds } from './data/sounds';

export class AudioManager {
  constructor() {
    this.loader = new AudioLoader();
    this.listener = new AudioListener();
  }

  addListenerToCamera(camera) {
    camera.add(this.listener);
  }

  async loadAllAudio(appLoader) {
    this.audios = {};
    const audioNames = Object.keys(Sounds);
    appLoader.assetsLoaded = 0;
    appLoader.assetsCount = audioNames.length;
    const path = 'assets/sounds/';
    for (let audioName of audioNames) {
      const soundBuffer = await this.loadAudio(path + Sounds[audioName]);
      const audio = new Audio(this.listener);
      audio.setBuffer(soundBuffer);
      this.audios[audioName] = audio;
      appLoader.assetsLoaded++;
    }
  }

  playAudio(audioName, volume = 0.5, isLoop = false) {
    const audio = this.audios[audioName];
    if (audio.isPlaying) {
      audio.stop();
    }
    audio.setVolume(volume);
    audio.setLoop(isLoop);
    audio.play();
  }

  stopAudio(audioName) {
    this.audios[audioName].stop();
  }

  stopAllAudio() {
    Object.keys(this.audios).forEach(audioName => {
      const audio = this.audios[audioName];
      if (audio && audio.isPlaying) {
        audio.stop();
      }
    });
  }

  async loadAudio(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(path, sound => {
        return resolve(sound);
      });
    });
  }
}
