const componentStyle = `
    <style>

        .app-loader {
            position: absolute;
            z-index: 100;
            width: 100%;
            height: 100%;
            background-color: #d0d0d0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .loading-text {
            margin-top: 20px;
            font-size: 36px;
            color: #272D38;
            font-family: Arial;
            font-weight: 700;
        }

        .loading-status {
            font-family: Arial;
            font-size: 16px;
            margin-top: 20px;
        }

        .progress-bar {
            margin-top: 10px;
            height: 10px;
            background-color: #e0e0e0;
            width: 90%;
            max-width: 600px;
        }

        .progress-bar-item {
            height: 100%;
            background-color: #0086B7;
            transition: 0.2s ease-in;
        }

         @media only screen and (max-height: 550px) {
             #loadingIcon {
                height: 86px;
                width: auto;
             }

            .loading-text {
             font-size: 26px;
            }

             .loading-status {
                font-size: 12px;
            }

        .progress-bar {
            height: 5px;
        }
    </style>
`;

export class AppLoader extends HTMLElement {
  constructor() {
    super();
    this.prop = {
      assetsLoaded: 0,
      assetsCount: 0,
      loadingText: '',
      onMoveCallback: null
    };
    this.updateDOM();
  }

  get loadingText() {
    return this.prop.loadingText;
  }

  get assetsLoaded() {
    return this.prop.assetsLoaded;
  }

  get assetsCount() {
    return this.prop.assetsCount;
  }

  set loadingText(loadingText) {
    this.prop.loadingText = loadingText;
    this.querySelector('#loadingText').innerHTML = loadingText;
  }

  set assetsLoaded(assetLoaded) {
    this.prop.assetsLoaded = assetLoaded;
    const loadPercentage =
      (this.prop.assetsLoaded / this.prop.assetsCount) * 100;
    this.querySelector('#assetsLoaded').innerHTML = assetLoaded;
    this.querySelector(
      '.progress-bar'
    ).innerHTML = `<div class="progress-bar-item" style="width: ${loadPercentage}%;"></div>`;
  }

  set assetsCount(assetCount) {
    this.prop.assetsCount = assetCount;
    this.querySelector('#assetsCount').innerHTML = assetCount;
  }

  updateDOM() {
    const loadPercentage =
      (this.prop.assetsLoaded / this.prop.assetsCount) * 100;
    this.innerHTML = `
        ${componentStyle}
        <div class="app-loader">
            <img id="loadingIcon" src="assets/images/loader.gif">
            <span class="loading-text">LOADING</span>
            <span class="loading-status">
            <span id="loadingText">Fetching assets</span>  
            <span id="assetsLoaded">${this.prop.assetsLoaded}</span>/
            <span id="assetsCount">${this.prop.assetsCount}</span></span>
            <div class="progress-bar">
                <div class="progress-bar-item" style="width: ${loadPercentage}%;"></div>
            </div>
        </div>
        `;
  }

  static get observedAttributes() {
    return ['assetCount', 'assetLoaded', 'loadingText'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'assetsCount':
        this.assetsCount = newValue;
        break;

      case 'assetsLoaded':
        this.assetsLoaded = newValue;
        break;
      case 'loadingText':
        this.loadingText = newValue;
        break;
    }
  }
}

customElements.define('app-loader', AppLoader);
