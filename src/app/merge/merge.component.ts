import { Component, OnInit } from '@angular/core';

import { Merge } from './game/merge';
import { State } from './game/state';

import { Tools } from './game/tools';

@Component({
  selector: 'app-merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.css']
})
export class MergeComponent implements OnInit {

  game: Merge = new Merge(7, 5, 6);
  board: number[][] = this.game.display();
  changeSelected: boolean = false;
  undoSelected: boolean = false;
  crushSelected: boolean = false;

  constructor() { }

  ngOnInit(): void {

  }

  getStyle(value: number, row: number, column: number) {
    let willBeChanged: boolean = false;
    /*if (this.toBeChanged != null && this.toBeChanged.row == row && this.toBeChanged.column == column) {
      willBeChanged = true;
    }*/
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

  onClick(row: number, col: number) {
    this.game.doPlay(row, col);
    this.board = this.game.display();
  }

  canDisplayNext(): boolean {
    if (this.game.state != State.Ingame) {
      return true;
    }
    return false;
  }


  selectCrush(): void {

  }

  selectChange(): void {

  }

  undo(): void {

  }

}
