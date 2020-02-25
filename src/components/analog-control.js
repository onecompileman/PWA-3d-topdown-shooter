import * as Hammer from 'hammerjs';
import * as Three from 'three';

const componentStyle = `
    <style>
        .analog-wrapper {
          padding: 50px;
        }

        .analog-container {
            height: 70px;
            width: 70px;
            border-radius: 100%;
            border: 1px solid rgba(0,0,0, 0.4);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 100000;
        }

        .analog-thumb {
            height: 40px;
            width: 40px;
            position: absolute;
            background-color: rgba(0,0,0,0.5);
            border-radius: 100%;
            z-index: 10;
        }
    </style>
`;

export class AnalogControl extends HTMLElement {
  constructor() {
    super();
    this.prop = {
      velocity: new Three.Vector2(),
      angle: 0,
      dragStart: null
    };
    this.updateDom();
    this.bindEvents();
  }

  updateDom() {
    /*html*/
    this.innerHTML = `
        ${componentStyle}
        <div class="analog-wrapper">
          <div class="analog-container">
            <div class="analog-thumb"></div>
          </div>
        </div>
        `;
  }

  get velocity() {
    return this.prop.velocity;
  }

  bindEvents() {
    const wrapper = this.querySelector('.analog-wrapper');
    wrapper.addEventListener('touchstart', event =>
      this.handleMouseDown(event)
    );
    wrapper.addEventListener('touchmove', event => this.handleMouseMove(event));
    wrapper.addEventListener('touchend', event => this.handleMouseUp(event));
  }
  handleMouseDown(event) {
    this.prop.dragStart = {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY
    };
  }

  handleMouseMove(event) {
    if (this.prop.dragStart && event.changedTouches) {
      const { clientX, clientY } = event.changedTouches[0];
      const thumb = this.querySelector('.analog-thumb');
      const maxDiff = 50;
      const xDiff = clientX - this.prop.dragStart.x;
      const yDiff = clientY - this.prop.dragStart.y;
      const angle = Math.atan2(yDiff, xDiff);
      const distance = Math.min(maxDiff, Math.hypot(xDiff, yDiff));
      const xNew = distance * Math.cos(angle);
      const yNew = distance * Math.sin(angle);
      thumb.style.transform = `translate3d(${xNew}px, ${yNew}px, 0px)`;
      this.prop.angle = angle;
      this.prop.velocity = new Three.Vector2(xNew, yNew);
    }
  }

  handleMouseUp(event) {
    if (this.prop.dragStart) {
      const thumb = this.querySelector('.analog-thumb');
      thumb.style.transform = `translate3d(0px, 0px, 0px)`;
      this.prop.dragStart = null;
      this.prop.velocity = new Three.Vector2(0, 0);
      this.prop.angle = 0;
    }
  }

  resetAnalogThumb() {
    const analogThumb = this.querySelector('.analog-thumb');
    analogThumb.style.left = '15px';
    analogThumb.style.top = '15px';
  }
}

customElements.define('analog-control', AnalogControl);
