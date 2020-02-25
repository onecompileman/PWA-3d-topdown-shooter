export class ScreenManager {
  constructor() {
    this.screens = {
      appLoader: document.querySelector('app-loader'),
      gameMenu: document.querySelector('game-menu'),
      gameTopBar: document.querySelector('game-top-bar')
    };

    this.controls = {
      left: document.querySelector('analog-control#left'),
      right: document.querySelector('analog-control#right')
    };
  }

  showScreen(screenName) {
    this.screens[screenName].style.display = 'block';
  }

  hideScreen(screenName) {
    this.screens[screenName].style.display = 'none';
  }

  showControls() {
    Object.keys(this.controls).forEach(key => {
      this.controls[key].style.display = 'block';
    });
  }

  hideControls() {
    Object.keys(this.controls).forEach(key => {
      this.controls[key].style.display = 'none';
    });
  }

  hideAllScreen() {
    Object.keys(this.screens).forEach(key => {
      this.screens[key].style.display = 'none';
    });
  }
}
