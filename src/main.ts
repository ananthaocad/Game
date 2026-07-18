import { Game } from './core/Game';

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const hudRoot = document.getElementById('hud') as HTMLElement;

const game = new Game(canvas, hudRoot);
game.start();
