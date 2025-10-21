import { Application, Assets, Sprite } from 'pixi.js';
import { IntroController } from './controllers/IntroController';
import { GameController } from './controllers/GameController';
import { GameViewAssets } from './views/GameView';
import { PuzzlePiece } from './models/GameModel';
import { animate } from "animejs";

import solveThePuzzleImage from './assets/images/solvethepuzzle.webp';
import startButtonImage from './assets/images/start-btn.webp';
import backgroundImage from './assets/images/background.webp';
import logoImage from './assets/images/logo.webp';
import previewImage from './assets/images/preview.webp';
import barImage from './assets/images/bar.webp';
import playBtnImage from './assets/images/play-btn.webp';
import handImage from './assets/images/hand.webp';
import completeTextImage from './assets/images/completethepuzzle.webp';
import finalImage from './assets/images/final.webp';
import puzzle1Image from './assets/images/puzzle-1.webp';
import puzzle6Image from './assets/images/puzzle-6.webp';
import puzzle8Image from './assets/images/puzzle-8.webp';
import puzzle11Image from './assets/images/puzzle-11.webp';

export enum SceneType {
  Intro,
  Game,
}

async function main() {
  const app = new Application();

  await app.init({
    resizeTo: window,
    backgroundColor: 0xffffff,
  });

  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) throw new Error('No #game-container element');
  gameContainer.appendChild(app.canvas);

  await Assets.load([
    { alias: 'introPuzzleImage', src: solveThePuzzleImage },
    { alias: 'startButtonImage', src: startButtonImage },
    { alias: 'backgroundImage', src: backgroundImage },
    { alias: 'logoImage', src: logoImage },
    { alias: 'previewImage', src: previewImage },
    { alias: 'barImage', src: barImage },
    { alias: 'playBtnImage', src: playBtnImage },
    { alias: 'handImage', src: handImage },
    { alias: 'completeTextImage', src: completeTextImage },
    { alias: 'finalImage', src: finalImage },
    { alias: 'puzzle1Image', src: puzzle1Image },
    { alias: 'puzzle6Image', src: puzzle6Image },
    { alias: 'puzzle8Image', src: puzzle8Image },
    { alias: 'puzzle11Image', src: puzzle11Image },
  ]);

  const backgroundSprite = new Sprite(Assets.get('backgroundImage'));
  backgroundSprite.width = app.screen.width;
  backgroundSprite.height = app.screen.height;
  app.stage.addChild(backgroundSprite);

  const logoSprite = new Sprite(Assets.get('logoImage'));
  logoSprite.anchor.set(0);
  const logoPadding = 20;
  logoSprite.position.set(0, logoPadding);
  logoSprite.scale.set(0.5);
  app.stage.addChild(logoSprite);

  const gameAssets: GameViewAssets = {
    preview: Assets.get('previewImage'),
    bar: Assets.get('barImage'),
    playBtn: Assets.get('playBtnImage'),
    hand: Assets.get('handImage'),
    pieceTextures: [
      Assets.get('puzzle1Image'),
      Assets.get('puzzle6Image'),
      Assets.get('puzzle8Image'),
      Assets.get('puzzle11Image'),
    ],
    logo: Assets.get('logoImage'),
    completeText: Assets.get('completeTextImage'),
    final: Assets.get('finalImage'),
  };

  const piecesData: PuzzlePiece[] = [
    { id: 1, image: 'puzzle-1.webp', slot: { row: 0, col: 0 }, placed: false },
    { id: 2, image: 'puzzle-6.webp', slot: { row: 1, col: 1 }, placed: false },
    { id: 3, image: 'puzzle-8.webp', slot: { row: 1, col: 3 }, placed: false },
    { id: 4, image: 'puzzle-11.webp', slot: { row: 2, col: 2 }, placed: false },
  ];

  let currentController: { destroy: () => void } | null = null;

  function showScene(scene: SceneType) {
    if (currentController) {
      currentController.destroy();
      currentController = null;
    }
    switch (scene) {
      case SceneType.Intro:
        currentController = new IntroController(app.stage, showScene, app.screen);
        break;
      case SceneType.Game:
        currentController = new GameController(app.stage, showScene, app.screen, gameAssets, piecesData);
        const gameView = (currentController as any).view?.container;
        if (gameView) {
          gameView.alpha = 0;
          animate(gameView, {
            alpha: 1,
            duration: 400,
            ease: 'outQuad'
          });
        }
        break;
    }
  }

  showScene(SceneType.Intro);
}

main();
