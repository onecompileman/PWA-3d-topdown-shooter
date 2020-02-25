import Swal from 'sweetalert2';

/*css*/
const componentStyle = `
    <style>
        .game-top-bar {
            position: absolute;
            height: 40px;
            width: 100%;
            top: 0;
            left: 0;
            z-index: 100;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: Arial;
            color: #eee;
        }

        .life-container {
            flex: 1;
            display: flex;
            margin-left: 15px;
        }

        .life-bar {
            width: 70%;
            max-width: 500px;
            height: 15px;
            background: rgba(150, 150, 150, 0.3);
        }

        .life-item {
            background-color: #0075B6;
            width: 40%;
            height: 100%;
        }

        .pause-button {
            width: 32px;
            height: 32px;
            background-color: #eee;
            cursor: pointer;
            margin-right: 15px;
        }

        .score-text {
            flex: 1;
            display: flex;
            justify-content: center;
        }

        .button-container {
            flex: 1;
            display: flex;
            justify-content: flex-end;
        }

    </style>
`;

export class GameTopBar extends HTMLElement {
  constructor() {
    super();
    this.prop = {
      onPauseCallback: null,
      onPlayCallback: null,
      score: 0,
      life: 100
    };
    this.updateDOM();
    this.bindEvents();
  }

  get onPauseCallback() {
    return this.prop.onPauseCallback;
  }

  set onPauseCallback(onPauseCallback) {
    this.prop.onPauseCallback = onPauseCallback;
  }

  get onPlayCallback() {
    return this.prop.onPlayCallback;
  }

  set onPlayCallback(onPlayCallback) {
    this.prop.onPlayCallback = onPlayCallback;
  }

  get life() {
    return this.prop.life;
  }

  set life(life) {
    this.prop.life = life;
    const lifeBarItem = this.querySelector('#lifeBarItem');
    lifeBarItem.style.width = life + '%';
  }

  get score() {
    return this.prop.score;
  }

  set score(score) {
    this.prop.score = score;
    const scoreText = this.querySelector('#scoreText');
    scoreText.innerHTML = `Skeletons Killed: ${score}`;
  }

  updateDOM() {
    /*html*/
    this.innerHTML = `
        ${componentStyle}
        <div class="game-top-bar">
            <div class="life-container">
                Life: 
                <div class="life-bar">
                    <div class="life-item" id="lifeBarItem"></div>
                </div>
            </div>
            <div class="score-text" id="scoreText">
                Skeletons Killed: 0
            </div>
            <div class="button-container">
                <div class="pause-button" id="pauseButton">
                </div>  
            </div>
        </div>
      `;
  }

  bindEvents() {
    this.querySelector('#pauseButton').addEventListener('click', () => {
      this.prop.onPauseCallback();
      Swal.fire({
        title: 'Game is Paused!',
        text: 'Press the button below to continue',
        icon: 'warning',
        confirmButtonText: 'Play'
      }).then(() => {
        this.prop.onPlayCallback();
      });
    });
  }

  static get observedAttributes() {
    return ['onPauseCallback', 'onPlayCallback', 'score', 'life'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'onPauseCallback':
        this.onPauseCallback = newValue;
        break;
      case 'onPlayCallback':
        this.onPlayCallback = newValue;
        break;
      case 'score':
        this.score = newValue;
        break;
      case 'life':
        this.life = newValue;
        break;
    }
  }
}

customElements.define('game-top-bar', GameTopBar);
