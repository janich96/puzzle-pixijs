import { Container, Sprite, Texture, Text } from 'pixi.js';
import { animate } from 'animejs';
import { PuzzlePiece } from '../models/GameModel';

export interface GameViewAssets {
  preview: Texture;
  bar: Texture;
  playBtn: Texture;
  hand: Texture;
  pieceTextures: Texture[];
  logo: Texture;
  completeText: Texture;
  final: Texture;
}

export class GameView {
  public container: Container;
  public fieldContainer: Container;
  public trayContainer: Container;
  public playButton: Sprite;
  public hand: Sprite;
  public pieceSprites: Sprite[] = [];
  public completeText: Sprite;
  public finalSprite: Sprite;
  private pulseSpeed = 0.04;
  private _pulseRAF?: number;

  constructor(assets: GameViewAssets) {
    this.container = new Container();
    this.container.sortableChildren = true;

    const scale = 0.5;
    const screenWidth = window.innerWidth || 1920;
    const screenHeight = window.innerHeight || 1080;

    this.completeText = new Sprite(assets.completeText);
    this.completeText.anchor.set(0, 0);
    this.completeText.position.set(80 + screenWidth * 0.15, 120 + screenHeight * 0.1);
    this.completeText.scale.set(scale);
    this.container.addChild(this.completeText);

    this.fieldContainer = new Container();
    const preview = new Sprite(assets.preview);
    preview.anchor.set(0.5);
    preview.position.set(950 + screenWidth * 0.1, 320);
    preview.scale.set(scale);
    this.fieldContainer.addChild(preview);
    this.container.addChild(this.fieldContainer);

    this.trayContainer = new Container();
    const bar = new Sprite(assets.bar);
    bar.anchor.set(0, 0);
    this.trayContainer.x = 60 + screenWidth * 0.05;
    this.trayContainer.y = 220 + screenHeight * 0.10;
    bar.position.set(0, 0);
    bar.scale.set(0.80);
    this.trayContainer.addChild(bar);
    this.container.addChild(this.trayContainer);

    this.playButton = new Sprite(assets.playBtn);
    this.playButton.anchor.set(0.5);
    this.playButton.position.set(210 + screenWidth * 0.15, 400 + screenHeight * 0.3);
    this.playButton.scale.set(scale);
    this.container.addChild(this.playButton);

    let pulseT = 0;
    const pulse = () => {
      pulseT += 0.04;
      const s = scale * (1 + 0.08 * Math.sin(pulseT));
      this.playButton.scale.set(s);
      requestAnimationFrame(pulse);
    };
    pulse();

    this.playButton.eventMode = 'static';
    this.playButton.cursor = 'pointer';
    this.playButton.on('pointerdown', () => {
      window.open('https://play.google.com/store/apps/details?id=com.bandagames.mpuzzle.gp', '_blank');
    });

    this.finalSprite = new Sprite(assets.final);
    this.finalSprite.anchor.set(0.5);
    this.finalSprite.position.set(950 + screenWidth * 0.1, 320);
    this.finalSprite.scale.set(scale);
    this.finalSprite.visible = false;
    this.container.addChild(this.finalSprite);

    this.hand = new Sprite(assets.hand);
    this.hand.anchor.set(0.5);
    this.hand.scale.set(scale);
    this.hand.zIndex = 1000;
    this.container.addChild(this.hand);
  }

  addPieceSprite(piece: PuzzlePiece, texture: Texture, x: number, y: number) {
    const scale = 0.5;
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.position.set(x + 190, y + y * 0.55);
    sprite.scale.set(scale);
    this.pieceSprites.push(sprite);
    this.container.addChild(sprite);
    this.container.setChildIndex(this.hand, this.container.children.length - 1);
    return sprite;
  }

  clearPieces() {
    for (const s of this.pieceSprites) s.destroy();
    this.pieceSprites = [];
  }

  removeTrayPieces() {
    this.clearPieces();
  }

  acceleratePlayButtonPulse() {
    let pulseT = 0;
    const scale = 0.5;
    const fastPulse = () => {
      pulseT += 0.12;
      const s = scale * (1 + 0.16 * Math.sin(pulseT));
      this.playButton.scale.set(s);
      this._pulseRAF = requestAnimationFrame(fastPulse);
    };
    if (this._pulseRAF) cancelAnimationFrame(this._pulseRAF);
    fastPulse();
  }

  playCompletionAnimation(onComplete?: () => void) {
    const screenWidth = window.innerWidth || 1920;
    const screenHeight = window.innerHeight || 1080;

    this.fieldContainer.visible = false;
    this.finalSprite.visible = true;

    const finalTargetX = 80 + screenWidth * 0.15;
    const finalTargetY = 120 + screenHeight * 0.1;
    const playButtonTargetX = finalTargetX + this.finalSprite.width * 1.1;
    const playButtonTargetY = finalTargetY + this.finalSprite.height * 0.65;

    animate(this.finalSprite.position, {
      x: finalTargetX + this.finalSprite.width / 4,
      y: finalTargetY + this.finalSprite.height / 4,
      duration: 800,
      ease: 'outQuad'
    });

    animate(this.completeText, {
      alpha: 0,
      duration: 600,
      ease: 'outQuad'
    });

    animate(this.trayContainer, {
      alpha: 0,
      duration: 600,
      ease: 'outQuad'
    });

    animate(this.playButton.position, {
      x: playButtonTargetX,
      y: playButtonTargetY,
      duration: 800,
      ease: 'outQuad',
      onComplete: () => {
        this.acceleratePlayButtonPulse();
        if (onComplete) onComplete();
      }
    });
  }
}
