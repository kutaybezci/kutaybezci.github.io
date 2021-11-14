import { Component, OnInit } from '@angular/core';
import { BoardIndex } from './game/board-index';
import { Game } from './game/game';
import { Tools } from './game/tools';

@Component({
  selector: 'app-merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.css']
})
export class MergeComponent implements OnInit {

  game: Game = new Game();
  backUp: Game = new Game();
  toBeChanged: BoardIndex | null = null;
  board: number[][] = this.game.getBoard();
  changeSelected: boolean = false;
  undoSelected: boolean = false;
  crushSelected: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  getStyle(value: number, row: number, column: number) {
    let willBeChanged: boolean = false;
    if (this.toBeChanged != null && this.toBeChanged.row == row && this.toBeChanged.column == column) {
      willBeChanged = true;
    }
    return {
      'background-color': value > 0 ? Tools.pallette(value) : 'black',
      'color': 'black',
      'height': '50px',
      'width': '50px',
      'text-align': 'center',
      'vertical-align': 'middle',
      'font-weight': 'bold',
      'border': willBeChanged ? '1px solid red' : '',
    };
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onClick(row: number, col: number) {
    this.backUp = this.game.copy();
    const boardIndex: BoardIndex = new BoardIndex(row, col);
    if (this.crushSelected) {
      this.game.doRemove(boardIndex);
      this.crushSelected = false;
    } else if (this.changeSelected) {
      if (this.toBeChanged == null) {
        this.toBeChanged = boardIndex;
      } else {
        this.game.doChange(this.toBeChanged, boardIndex);
        this.toBeChanged = null;
        this.changeSelected = false;
      }
    } else {
      this.game.doPlay(col);
    }
    this.board = this.game.getBoard();
  }

  selectCrush(): void {
    if (!this.crushSelected && this.game.special > 0) {
      this.crushSelected = true;
    } else {
      this.crushSelected = false;
    }
    this.changeSelected = false;
  }

  selectChange(): void {
    if (!this.changeSelected && this.game.special > 0) {
      this.changeSelected = true;
    } else {
      this.changeSelected = false;
      this.toBeChanged = null;
    }
    this.crushSelected = false;
  }

  undo(): void {
    if (this.backUp.special > 0) {
      this.backUp.special = this.backUp.special - 1;
      this.game = this.backUp;
      this.board = this.game.getBoard();
    }
  }

}
