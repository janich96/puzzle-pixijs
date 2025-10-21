import { Container, Rectangle } from 'pixi.js';
import { SceneType } from '../main';
import { IntroView } from '../views/IntroView';
import { animate } from 'animejs';

export class IntroController {
  private view: IntroView;
  private goToScene: (scene: SceneType) => void;

  constructor(parentContainer: Container, goTo: (scene: SceneType) => void, screen: Rectangle) {
    this.goToScene = goTo;
    this.view = new IntroView(screen);
    parentContainer.addChild(this.view.container);

    this.view.onStartClick = () => {
      animate(this.view.container, {
        alpha: 0,
        duration: 400,
        ease: 'outQuad',
        onComplete: () => {
          this.goToScene(SceneType.Game);
        }
      });
    };
  }

  destroy() {
    this.view.destroy();
  }
}