export class BoardIndex {


    constructor(public row: number, public column: number) {

    }

    copy(): BoardIndex {
        return new BoardIndex(this.row, this.column);
    }

    equals(boardIndex: BoardIndex): boolean {
        if (boardIndex == null) {
            return false;
        }
        return this.row == boardIndex.row && this.column == boardIndex.column;
    }

    move(rowDiff: number, colDiff: number): void {
        this.row += rowDiff;
        this.column += colDiff;
    }

    minus(boardIndex: BoardIndex): BoardIndex {
        return new BoardIndex(this.row - boardIndex.row, this.column - boardIndex.column);
    }

    plus(boardIndex: BoardIndex) {
        return new BoardIndex(this.row + boardIndex.row, this.column + boardIndex.column);
    }

}
