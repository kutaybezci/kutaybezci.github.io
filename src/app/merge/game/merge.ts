
import { State } from "./state";
import { Tools } from "./tools";

export class Merge {
    columnList: number[][] = [];
    backUp: number[][] = [];
    maxRowSize: number;
    score: number = 0;
    special: number = 0;
    state: State = State.Playing;
    inputMin: number = 1;
    inputMax: number;
    next: number;
    message: string = 'Ulkume';
    changeStack: [number, number][] = [];
    static readonly UnsetIndex: [number, number] = [-1, -1];
    toBeChanged: [number, number] = Merge.UnsetIndex;


    constructor(maxRowSize: number, columnSize: number, inputMax: number) {
        this.maxRowSize = maxRowSize;
        this.inputMax = inputMax;
        for (let i = 0; i < columnSize; i++) {
            this.columnList.push([]);
        }
        this.next = Tools.dice(this.inputMin, this.inputMax);
    }

    doPlay(row: number, column: number): number[][] {
        this.log('before');
        this.message = '';
        let onTable: boolean = this.contains(row, column);
        if (this.state == State.Playing) {
            this.startTurn(column);
        } else if (this.state == State.Crushing) {
            if (!onTable) {
                this.message = 'Cannot remove empty';
            } else {
                this.remove(row, column);
                this.state = State.Ingame;
            }
        } else if (this.state == State.Changing) {
            if (this.contains(this.toBeChanged[0], this.toBeChanged[1])) {
                this.change(row, column);
            } else {
                this.toBeChanged = [row, column];
            }
        }
        if (this.state == State.Ingame) {
            this.subTurn();
        }
        return this.display();
    }

    subTurn() {
        this.removeUntilMatch();
        if (this.changeStack.length > 0) {
            const playIndex: [number, number] = this.changeStack.pop()!;
            this.processIndex(playIndex[0], playIndex[1]);
            this.removeUntilMatch();
        }
        if (this.changeStack.length == 0) {
            if (this.isGameOver()) {
                this.state = State.GameOver;
            } else {
                this.state = State.Playing;
            }
        }
    }

    private change(row: number, column: number) {
        if (row == this.toBeChanged[0] && column == this.toBeChanged[1]) {
            this.message = 'Cannot choose same value to change';
            return;
        }
        let value: number = this.value(row, column);
        this.setValue(row, column, this.value(this.toBeChanged[0], this.toBeChanged[1]));
        this.setValue(this.toBeChanged[0], this.toBeChanged[1], value);
        this.changeStack.push([row, column]);
        this.changeStack.push([this.toBeChanged[0], this.toBeChanged[1]]);
        this.state = State.Ingame;
    }

    startTurn(column: number): void {
        if (!this.isColAvailable(column)) {
            this.message = 'column is full!';
            return;
        }
        this.columnList[column].push(this.next);
        this.next = Tools.dice(this.inputMin, this.inputMax);
        this.changeStack.push([this.columnList[column].length - 1, column]);
        this.state = State.Ingame;
    }

    private contains(row: number, column: number) {
        if (row < 0 || column < 0 || column >= this.columnList.length) {
            return false;
        }
        if (row >= this.columnList[column].length) {
            return false;
        }
        return true;
    }

    private value(row: number, column: number) {
        if (!this.contains(row, column)) {
            return 0;
        }
        return this.columnList[column][row];
    }

    private setValue(row: number, column: number, value: number): void {
        if (this.contains(row, column)) {
            this.columnList[column][row] = value;
        }
    }

    private removeUntilMatch() {
        while (this.changeStack.length > 0 && !this.checkTopStackMatch()) {
            this.changeStack.pop();
        }
    }


    private checkTopStackMatch(): boolean {
        if (this.changeStack.length == 0) {
            return false;
        }
        const cs: [number, number] = this.changeStack[this.changeStack.length - 1];
        const value: number = this.value(cs[0], cs[1]);
        if (value == 0) {
            return false;
        }
        const neighbours: [number, number][] = this.neighbours(cs[0], cs[1]);
        for (let index of neighbours) {
            if (value == this.value(index[0], index[1])) {
                return true;
            }
        }
        return false;
    }

    private neighbours(row: number, column: number): [number, number][] {
        return [
            [row - 1, column],
            [row + 1, column],
            [row, column - 1],
            [row, column + 1]
        ];
    }


    private processIndex(row: number, column: number): boolean {
        this.log(`processing ${row}, ${column}`);
        let value = this.value(row, column);
        let match = 0;
        if (value == 0) {
            return false;
        }
        const neighbours: [number, number][] = this.neighbours(row, column);

        for (let index of neighbours) {
            if (this.value(index[0], index[1]) == value) {
                match++;
                this.setValue(index[0], index[1], 0);
                this.log('matched');
            }
        }
        if (match == 0) {
            return false;
        }
        if (match > 0) {
            value += match;
            this.setValue(row, column, value);
            this.score += value;
            this.changeStack.push([row, column]);
            for (let index of neighbours) {
                if (this.contains(index[0], index[1]) && this.value(index[0], index[1]) == 0) {
                    this.remove(index[0], index[1]);
                    this.log('removed');
                }
            }
        }
        return true;
    }

    remove(row: number, column: number) {
        if (this.contains(row, column)) {
            this.columnList[column].splice(row, 1);
            row -= 1;
            for (let r = row; r < this.columnList[column].length; r++) {
                this.changeStack.push([r, column]);
            }
            this.log('removing');
            this.state = State.Ingame;
        }
    }



    private isColAvailable(column: number): boolean {
        if (this.columnList[column].length < this.maxRowSize) {
            return true;
        }
        if (this.columnList[column].length == this.maxRowSize
            && this.next == this.columnList[column][this.maxRowSize - 1]) {
            return true;
        }
        return false;
    }

    private row(row: number): number[] {
        const rowValues: number[] = [];
        for (let c = 0; c < this.columnList.length; c++) {
            if (row < this.columnList[c].length) {
                rowValues.push(this.columnList[c][row]);
            } else {
                rowValues.push(0);
            }
        }
        return rowValues;
    }

    display(): number[][] {
        let display: number[][] = [];
        for (let r = 0; r < this.maxRowSize; r++) {
            display.push(this.row(r));
        }
        return display;
    }

    isGameOver(): boolean {
        for (let c = 0; c < this.columnList.length; c++) {
            if (this.isColAvailable(c)) {
                return false;
            }
        }
        return true;
    }


    log(header: string) {
        console.log(header);
        let board: number[][] = this.display();
        for (let r = 0; r < board.length; r++) {
            let log: string = '';
            for (let c = 0; c < board[r].length; c++) {
                log += board[r][c];
                if (this.changeStack.includes([r, c])) {
                    log += '.';
                } else {
                    log += ' ';
                }
            }
            console.log(log);
        }
        for (let cs of this.changeStack) {
            console.log(`[${cs[0]}, ${cs[1]}]`);
        }
    }
}

