import Swal from 'sweetalert2';

const componentStyles = `
    <style>
         @font-face {
            font-family: "Mage Hunter";
            src: url("/assets/fonts/magehunter.ttf");"svg");
        }

        .game-menu {
            background: url('assets/images/menu-bg.jpg');
            position: absolute;
            z-index: 100;
            width: 100%;
            height: 100%;
        }

        .game-text {
            font-family: Mage Hunter;
            color: #f6f6f6;
            font-size: 70px;
            margin-top: 150px;
            text-align: center;
        }

        .menu-overlay {
            background-color: rgba(100,100, 240, 0.2);
            position: fixed;
            z-index: 1;
            height: 100%;
            width: 100%;
        }

        .footer-text {
            position: absolute;
            bottom: 20px;
            font-family: Arial;
            right: 10px;
            color: #f0f0f0;
            font-size: 16px;
        }

        .game-menu-btn-container {
            margin-top: 20px;
            position: absolute;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 1000;
        }

        .game-menu-btn {
            display: flex; 
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-family: Arial;
            height: 48px;
            max-width: 500px;
            width: 80%;
            transition: 0.3s linear;
            background: rgba(158,152, 146, 0.7);
            cursor: pointer;
            color: #ddd;
            margin: 12px;
        }
        

        .game-menu-btn:hover {
            background: rgba(0,117,182, 0.9);
        }

        @media only screen and (max-height: 550px) {
            .game-text {
                margin: 20px;
                margin-top: 30px;
                font-size: 55px
            }

            .game-menu-btn {
                margin: 8px;
                height: 42px;
                font-size: 20px;
            }
        }

    </style>
`;

export class MenuPage extends HTMLElement {
  constructor() {
    super();
    this.prop = {
      onPlayCallback: null
    };
    this.updateDOM();
    this.bindEvents();
  }

  set onPlayCallback(onPlayCallback) {
    this.prop.onPlayCallback = onPlayCallback;
  }

  get onPlayCallback() {
    return this.prop.onPlayCallback;
  }

  bindEvents() {
    this.querySelector('#about').addEventListener('click', () =>
      this.showAbout()
    );

    this.querySelector('#play').addEventListener('click', () =>
      this.onPlayCallback()
    );

    this.querySelector('#howToPlay').addEventListener('click', () =>
      this.howToPlayCallback()
    );
  }

  howToPlayCallback() {
    /*html*/
    Swal.fire({
      html: `<img src="/assets/images/how-to-play.jpg" style="width: 80%; max-height: 80%;">`,
      width: '100%'
    });
  }

  showAbout() {
    /*html*/
    Swal.fire({
      html: `
        <h2>About the game</h2>
        <p>Crazy Wizard is a simple 3d Topdown shooter game created using Webpack, Three.js, Webcomponents and Workbox</p>
        <p>Game Created by: <a href="https://onecompileman.com">Stephen Vinuya</a></p>
        <p>
           3d models and assets by: <a href="http://quaternius.com/">Quaternius</a> 
        </p>  
    `
    });
  }

  updateDOM() {
    const appVersion = `v0.5`;
    /*html*/
    this.innerHTML = `
        ${componentStyles}
        <div class="game-menu">
            <div class="menu-overlay"></div>
            <h1 class="game-text">
           Crazy Wizard</h1>
            <div class="game-menu-btn-container">
                <div class="game-menu-btn" id="play">
                    Play
                </div>
                <div class="game-menu-btn" id="howToPlay">
                    How to play
                </div>
                <div class="game-menu-btn" id="about">
                    About
                </div>
            </div>
           
            <div class="footer-text">
               ${appVersion} (c) 2020 <b>STEPHEN VINUYA</b>
            </div>
        </div>
      `;
  }

  static get observedAttributes() {
    return ['onPlayCallback'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'onPlayCallback':
        this.onPlayCallback = newValue;
        break;
    }
  }
}

customElements.define('game-menu', MenuPage);
