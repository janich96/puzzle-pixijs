import { Container, Rectangle, Sprite } from 'pixi.js';
import { animate } from 'animejs';
import { SceneType } from '../main';
import { GameModel, PuzzlePiece } from '../models/GameModel';
import { GameView, GameViewAssets } from '../views/GameView';

export class GameController {
  private container: Container;
  private model: GameModel;
  private view: GameView;
  private screen: Rectangle;
  private goTo: (scene: SceneType) => void;
  private draggingPiece: { piece: PuzzlePiece; sprite: Sprite; originalZ: number; } | null = null;
  private gameActive = false;
  private tutorialHandVisible = true;
  private handAnimationFrame: number | null = null;

  constructor(parentContainer: Container, goTo: (scene: SceneType) => void, screen: Rectangle, assets: GameViewAssets, piecesData: PuzzlePiece[]) {
    this.container = new Container();
    this.container.sortableChildren = true;
    this.container.eventMode = 'static';
    parentContainer.addChild(this.container);
    this.goTo = goTo;
    this.screen = screen;
    this.model = new GameModel(piecesData);
    this.view = new GameView(assets);
    this.container.addChild(this.view.container);
    this.startGame();

    this.initTrayPieces(assets);

    this.view.playButton.eventMode = 'static';
    this.view.playButton.cursor = 'pointer';
    this.view.playButton.on('pointerdown', () => {
      this.startGame();
    });
  }

  private startGame() {
    this.gameActive = true;
    this.initTrayPiecesActive();
    this.showTutorialHand();
  }

  private initTrayPieces(assets: GameViewAssets) {
    this.view.clearPieces();
    const trayStartX = 80;
    const trayY = 260;
    const gap = 120;
    this.model.pieces.forEach((piece, i) => {
      if (!piece.placed) {
        const x = trayStartX + i * gap + 20;
        const y = trayY + trayY * 0.05;
        const sprite = this.view.addPieceSprite(piece, assets.pieceTextures[i], x, y);
        sprite.zIndex = i;
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.on('pointerdown', () => {
          if (!this.gameActive) return;
          this.onPiecePointerDown(piece, sprite);
        });
      }
    });
  }

  private initTrayPiecesActive() {
    this.view.pieceSprites.forEach((sprite, i) => {
      const piece = this.model.pieces[i];
      
      sprite.removeAllListeners('pointerdown');
      sprite.on('pointerdown', (e: any) => {
        this.onPiecePointerDown(piece, sprite, e);
      });
    });
  }

  private getTrayPiecePosition(index: number) {
    const baseStartX = 80;
    const baseY = 260;
    const gap = 120;

    const rawX = baseStartX + index * gap + 20;
    const rawY = baseY + baseY * 0.05;

    const x = rawX + 190;
    const y = rawY + rawY * 0.55;
    return { x, y };
  }

  private getSlotSize(): number {
    const previewSprite = this.view.fieldContainer.children[0] as any; // Sprite
    return previewSprite.width / 4;
  }

  private getFieldSlotPosition(row: number, col: number) {
    const previewSprite = this.view.fieldContainer.children[0] as any; // Sprite
    const slotSize = previewSprite.width / 4;

    const marginX = (previewSprite.width - slotSize * 4) / 2;
    const marginY = (previewSprite.height - slotSize * 4) / 2; // превью квадратное

    const originX = previewSprite.x - previewSprite.width / 2 + marginX;
    const originY = previewSprite.y - previewSprite.height / 2 + marginY;

    const x = originX + col * slotSize + slotSize / 2;
    const y = originY + row * slotSize + slotSize / 2;

    return { x, y };
  }

  private showTutorialHand() {
    const firstPiece = this.model.pieces.find(p => !p.placed);
    if (!firstPiece) return;
    const trayIndex = this.model.pieces.indexOf(firstPiece);
    const { x: pieceX, y: pieceY } = this.getTrayPiecePosition(trayIndex);
    const { x: slotCenterX, y: slotCenterY } = this.getFieldSlotPosition(firstPiece.slot.row, firstPiece.slot.col);
    this.view.hand.visible = true;
    this.tutorialHandVisible = true;
    const hand = this.view.hand;
    hand.alpha = 1;
    hand.visible = true;
    if (this.handAnimationFrame !== null) {
      cancelAnimationFrame(this.handAnimationFrame);
      this.handAnimationFrame = null;
    }
    const animateHandOnce = () => {
      hand.x = pieceX;
      hand.y = pieceY;
      hand.scale.set(0.5);
      hand.alpha = 1;
      let pressT = 0;
      const pressStep = () => {
        if (!hand.visible) return;
        pressT += 0.15;
        if (pressT >= 1) {
          hand.scale.set(0.4);
          moveToSlot();
          return;
        }
        hand.scale.set(0.5 - 0.1 * pressT);
        this.handAnimationFrame = requestAnimationFrame(pressStep);
      };
      pressStep();
      const moveToSlot = () => {
        let t = 0;
        const moveStep = () => {
          if (!hand.visible) return;
          t += 0.01;
          if (t >= 1) {
            hand.x = slotCenterX;
            hand.y = slotCenterY;
            hand.scale.set(0.4);
            releaseEffect();
            return;
          }
          hand.x = pieceX + (slotCenterX - pieceX) * t;
          hand.y = pieceY + (slotCenterY - pieceY) * t;
          hand.scale.set(0.4);
          this.handAnimationFrame = requestAnimationFrame(moveStep);
        };
        moveStep();
      };
      const releaseEffect = () => {
        let releaseT = 0;
        const releaseStep = () => {
          if (!hand.visible) return;
          releaseT += 0.12;
          if (releaseT >= 1) {
            hand.scale.set(0.5);
            hand.alpha = 0.0;
            setTimeout(() => {
              if (!hand.visible) return;
              animateHandOnce();
            }, 400);
            return;
          }
          hand.scale.set(0.4 + 0.1 * releaseT);
          this.handAnimationFrame = requestAnimationFrame(releaseStep);
        };
        releaseStep();
      };
    };
    animateHandOnce();
  }

  private onPiecePointerDown(piece: PuzzlePiece, sprite: any, e?: any) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (!this.gameActive || this.draggingPiece) return;
    if (piece.placed) return;
    
    this.hideTutorialHand(); 

    this.draggingPiece = { piece, sprite, originalZ: sprite.zIndex };

    animate([sprite.scale], {
      x: 0.6,
      y: 0.6,
      duration: 200,
      ease: 'outQuad',
    });

    this.container.on('globalpointermove', this.onDragMove);
    this.container.on('pointerup', this.onDragEnd);
    this.container.on('pointerupoutside', this.onDragEnd);
  }

  private onDragMove = (event: any) => {
    if (this.draggingPiece) {
      const pos = event.data.global;
      this.draggingPiece.sprite.position.set(pos.x, pos.y);
    }
  };

  private onDragEnd = (event: any) => {
    if (!this.draggingPiece) return;

    const { piece, sprite } = this.draggingPiece;

    this.container.off('globalpointermove', this.onDragMove);
    this.container.off('pointerup', this.onDragEnd);
    this.container.off('pointerupoutside', this.onDragEnd);

    const pos = sprite.position;
    const slotSize = this.getSlotSize();
    const tolerance = slotSize / 2;
    let placed = false;

    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const { x: cx, y: cy } = this.getFieldSlotPosition(row, col);
        if (Math.abs(pos.x - cx) < tolerance && Math.abs(pos.y - cy) < tolerance) {
          if (this.model.canPlacePiece(piece, row, col)) {
            this.model.placePiece(piece, row, col);

            const { x: cx, y: cy } = this.getFieldSlotPosition(row, col);

            let targetX = cx;
            let targetY = cy;

            if (piece.id === 1) {
              targetX += 5;
              targetY += 17;
            }

            if (piece.id === 2) {
              targetX += 2;
            }

            if (piece.id === 3) {
              targetX -= 5;
            }

            if (piece.id === 4) {
              targetY -= 3;
              targetX -= 2;
            }

            sprite.position.set(targetX, targetY);

            placed = true;
            
            sprite.eventMode = 'none';
            sprite.cursor = 'default';
            sprite.removeAllListeners();
            
            if (this.model.isComplete()) {
              this.onPuzzleComplete();
            }
            
            break;
          }
        }
      }
      if (placed) break;
    }

    if (!placed) {
      sprite.tint = 0xff4444;

      const trayIndex = this.model.pieces.indexOf(piece);
      const { x, y } = this.getTrayPiecePosition(trayIndex);
      animate(sprite.position, {
        x,
        y,
        duration: 450,
        ease: 'outQuad',
        complete: () => {
          let t = 0;
          const revertTint = () => {
            t += 0.08;
            const r = Math.round(0xff * (1 - t) + 0xff * t);
            const g = Math.round(0x44 * (1 - t) + 0xff * t);
            const b = Math.round(0x44 * (1 - t) + 0xff * t);
            sprite.tint = (r << 16) | (g << 8) | b;
            if (t < 1) {
              requestAnimationFrame(revertTint);
            } else {
              sprite.tint = 0xffffff;
            }
          };
          revertTint();
        }
      });
    }

    animate(sprite.scale, {
      x: 0.5,
      y: 0.5,
      duration: 200,
      ease: 'outQuad',
    });

    if (this.draggingPiece) {
      sprite.zIndex = this.draggingPiece.originalZ;
      this.container.sortChildren();
    }

    this.draggingPiece = null;
  };

  private hideTutorialHand = () => {
    if (this.tutorialHandVisible) {
      this.tutorialHandVisible = false;
      this.view.hand.visible = false;
      if (this.handAnimationFrame !== null) {
        cancelAnimationFrame(this.handAnimationFrame);
        this.handAnimationFrame = null;
      }
    }
  };

  private onPuzzleComplete() {
    this.gameActive = false;
    this.hideTutorialHand();

    this.view.removeTrayPieces();

    this.view.playCompletionAnimation(() => {
      console.log('Puzzle completed!');
    });
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
