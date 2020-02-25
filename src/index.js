import { GameManager } from './game/game-manager';
import './components/app-loader';
import './components/menu-page';
import './components/game-top-bar';
import './components/analog-control';

const gameManager = new GameManager();
gameManager.initGame();
