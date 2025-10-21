import { Container, Rectangle, Sprite, Assets, BlurFilter } from 'pixi.js';
import { animate } from 'animejs';

export class IntroView {
  public container: Container;
  public onStartClick?: () => void;
  private startButtonSprite: Sprite;
  private shadow: Sprite;
  private originalButtonScale: number;

  constructor(screen: Rectangle) {
    this.container = new Container();
    this.container.x = screen.width / 2;
    this.container.y = screen.height / 2;

    const titleTexture = Assets.get('introPuzzleImage');
    const titleSprite = new Sprite(titleTexture);
    titleSprite.anchor.set(0.5);
    titleSprite.scale.set(0.5);
    titleSprite.position.set(0, 0);
    this.container.addChild(titleSprite);

    const startButtonTexture = Assets.get('startButtonImage');

    this.shadow = new Sprite(startButtonTexture);
    this.shadow.anchor.set(0.5);
    this.shadow.scale.set(0.4);
    const desiredYFromTop = screen.height * 0.90;
    const yRelativeToContainerCenter = desiredYFromTop - (screen.height / 2);
    this.shadow.position.set(0, yRelativeToContainerCenter + 8);
    this.shadow.tint = 0x000000;
    this.shadow.alpha = 0.3;
    this.shadow.filters = [new BlurFilter({ strength: 8, quality: 4 })];
    this.container.addChild(this.shadow);

    this.startButtonSprite = new Sprite(startButtonTexture);
    this.startButtonSprite.anchor.set(0.5);
    this.startButtonSprite.scale.set(0.4);
    this.originalButtonScale = this.startButtonSprite.scale.x;
    this.startButtonSprite.position.set(0, yRelativeToContainerCenter);
    this.startButtonSprite.eventMode = 'static';
    this.startButtonSprite.cursor = 'pointer';
    this.startButtonSprite.on('pointerdown', () => {
      this.onStartClick?.();
    });
    this.container.addChild(this.startButtonSprite);
  }

  playButtonAnimation(onComplete: () => void) {
    animate([this.startButtonSprite.scale, this.shadow.scale], {
      x: [
        { to: this.originalButtonScale * 0.8, duration: 100, ease: 'outQuad' },
        { to: this.originalButtonScale, duration: 150, ease: 'outQuad' }
      ],
      y: [
        { to: this.originalButtonScale * 0.8, duration: 100, ease: 'outQuad' },
        { to: this.originalButtonScale, duration: 150, ease: 'outQuad' }
      ],
      onComplete
    });
  }

  destroy() {
    this.container.destroy({ children: true });
  }
} 