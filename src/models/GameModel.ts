export interface PuzzlePiece {
  id: number;
  image: string;
  slot: { row: number; col: number };
  placed: boolean;
  currentSlot?: { row: number; col: number };
}

export class GameModel {
  public readonly gridSize = 4;
  public readonly pieces: PuzzlePiece[];
  public readonly slots: (PuzzlePiece | null)[][];

  constructor(pieces: PuzzlePiece[]) {
    this.pieces = pieces;
    this.slots = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
    for (const piece of this.pieces) {
      piece.placed = false;
      piece.currentSlot = undefined;
    }
  }

  canPlacePiece(piece: PuzzlePiece, row: number, col: number): boolean {
    if (this.slots[row][col] !== null) return false;
    return piece.slot.row === row && piece.slot.col === col;
  }

  placePiece(piece: PuzzlePiece, row: number, col: number): boolean {
    if (this.canPlacePiece(piece, row, col)) {
      this.slots[row][col] = piece;
      piece.placed = true;
      piece.currentSlot = { row, col };
      return true;
    }
    return false;
  }

  removePiece(piece: PuzzlePiece) {
    if (piece.currentSlot) {
      this.slots[piece.currentSlot.row][piece.currentSlot.col] = null;
      piece.placed = false;
      piece.currentSlot = undefined;
    }
  }

  isComplete(): boolean {
    return this.pieces.every(p => p.placed);
  }
} 