import { BoardIndex } from "./board-index";

export class GameBoard {

    boardColumnList: number[][] = [];

    constructor(public maxRowCount: number, public maxColumnCount: number) {
        for (let i = 0; i < maxColumnCount; i++) {
            const column: number[] = [];
            this.boardColumnList.push(column);
        }
    }

    contains(boardIndex: BoardIndex): boolean {
        if (boardIndex.row < 0 || boardIndex.column < 0) {
            return false;
        }
        if (boardIndex.column >= this.maxColumnCount) {
            return false;
        }
        const boardColumn: number[] = this.boardColumnList[boardIndex.column];
        if (boardIndex.row >= boardColumn.length) {
            return false;
        }
        return true;
    }

    private addNeighbourIfExists(neighbours: BoardIndex[], boardIndex: BoardIndex, row: number, column: number): void {
        const neighbour = boardIndex.copy();
        neighbour.move(row, column);
        if (this.contains(neighbour)) {
            neighbours.push(neighbour);
        }
    }
    getNeighbours(boardIndex: BoardIndex): BoardIndex[] {
        const neighbours: BoardIndex[] = [];
        this.addNeighbourIfExists(neighbours, boardIndex, 1, 0);
        this.addNeighbourIfExists(neighbours, boardIndex, -1, 0);
        this.addNeighbourIfExists(neighbours, boardIndex, 0, 1);
        this.addNeighbourIfExists(neighbours, boardIndex, 0, -1);
        return neighbours;
    }

    getColumn(column: number): number[] {
        return this.boardColumnList[column];
    }

    getRowBasedBoard(): number[][] {
        let rowBasedBoard: number[][] = [];
        for (let r = 0; r < this.maxRowCount - 1; r++) {
            let row: number[] = [];
            for (let c = 0; c < this.maxColumnCount; c++) {
                let boardIndex = new BoardIndex(r, c);
                row.push(this.getValueSafe(boardIndex, 0));
            }
            rowBasedBoard.push(row);
        }
        return rowBasedBoard;
    }

    getValue(boardIndex: BoardIndex): number {
        return this.boardColumnList[boardIndex.column][boardIndex.row];
    }

    getValueSafe(boardIndex: BoardIndex, defaultValue: number): number {
        if (this.contains(boardIndex)) {
            return this.getValue(boardIndex);
        }
        return defaultValue;
    }

    setValue(boardIndex: BoardIndex, value: number): void {
        this.boardColumnList[boardIndex.column][boardIndex.row] = value;
    }

    remove(boardIndex: BoardIndex): BoardIndex[] {
        const boardColumn: number[] = this.getColumn(boardIndex.column);
        boardColumn.splice(boardIndex.row, 1);
        const upperSquares: BoardIndex[] = [];
        for (let r = boardIndex.row; r < this.maxColumnCount; r++) {
            let upper = new BoardIndex(boardIndex.column, r);
            upperSquares.push(upper);
        }
        return upperSquares;
    }

    isColumnOver(column: number): boolean {
        return this.getColumn(column).length >= this.maxRowCount;
    }

    top(column: number): number {
        const boardColumn: number[] = this.getColumn(column);
        if (boardColumn.length == 0) {
            return 0;
        }
        return boardColumn[boardColumn.length - 1];
    }

    canPush(column: number, value: number): boolean {
        const boardColumn: number[] = this.getColumn(column);
        return boardColumn.length < this.maxRowCount - 1 || value == this.top(column);
    }

    copy(): GameBoard {
        const gameBoard = new GameBoard(this.maxRowCount, this.maxColumnCount);
        for (let c = 0; c < this.boardColumnList.length; c++) {
            gameBoard.getColumn(c).push(...this.boardColumnList[c]);
        }
        return gameBoard;
    }

}
