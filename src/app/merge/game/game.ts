import { BoardIndex } from "./board-index";
import { GameBoard } from "./game-board";
import { State } from "./state";
import { Tools } from "./tools";

export class Game {

    score: number = 0;
    special: number = 0;
    inputMin: number = 1;
    inputMax: number = 6;
    nextNumber: number = Tools.dice(this.inputMin, this.inputMax);
    state: State = State.Playing;
    changeStack: BoardIndex[] = [];
    currentMaxValue: number = 6;
    distinctNumberCount: number = 7;
    gameBoard: GameBoard = new GameBoard(8, 5);

    startTurn(column: number): void {
        if (this.state != State.Playing) {
            return;
        }
        if (!this.gameBoard.canPush(column, this.nextNumber)) {
            return;
        }
        const boardColumn = this.gameBoard.getColumn(column);
        boardColumn.push(this.nextNumber);
        let boardIndex = new BoardIndex(boardColumn.length - 1, column);
        this.changeStack.push(boardIndex);
        this.setNextNumber();
        this.state = State.InTurn;
    }

    doPlay(column: number): void {
        this.startTurn(column);
        while (this.state == State.InTurn) {
            this.subTurn();
        }
    }

    doChange(first: BoardIndex, second: BoardIndex): void {
        this.change(first, second);
        while (this.state == State.InTurn) {
            this.subTurn();
        }
    }

    change(first: BoardIndex, second: BoardIndex): void {
        if (this.gameBoard.contains(first) && this.gameBoard.contains(second)) {
            let value = this.gameBoard.getValue(first);
            this.gameBoard.setValue(first, this.gameBoard.getValue(second));
            this.gameBoard.setValue(second, value);
            this.changeStack.push(first);
            this.changeStack.push(second);
            this.special--;
            this.state = State.InTurn;
        }
    }

    subTurn(): void {
        if (this.changeStack.length == 0) {
            let lessThanMin: null | BoardIndex = this.getLessThanMin();
            if (lessThanMin != null) {
                this.remove(lessThanMin);
                this.subTurn();
                return;
            }
            if (this.isGameOver()) {
                this.state = State.GameOver;
                return;
            }
            this.state = State.Playing;
            return;
        }
        const boardIndex: BoardIndex | undefined = this.changeStack.pop();
        if (boardIndex == undefined || !this.gameBoard.contains(boardIndex)) {
            return;
        }
        //log board
        const value: number = this.gameBoard.getValue(boardIndex);
        const neighbours: BoardIndex[] = this.gameBoard.getNeighbours(boardIndex);
        const toBeRemoveds: BoardIndex[] = [];
        let match: boolean = false;
        for (let neighbour of neighbours) {
            const neighbourValue: number = this.gameBoard.getValue(neighbour);
            if (value == neighbourValue) {
                this.score += value;
                this.changeStack.push(neighbour);
                this.changeStack.push(boardIndex);
                const mergeValue: number = value + 1;
                if (mergeValue > this.currentMaxValue) {
                    this.special += mergeValue - this.currentMaxValue;
                    this.currentMaxValue = mergeValue;
                    if (this.currentMaxValue > this.inputMin + this.distinctNumberCount) {
                        this.inputMin++;
                        this.inputMax++;
                        if (this.nextNumber < this.inputMin) {
                            this.setNextNumber();
                        }
                    }
                }
                this.gameBoard.setValue(boardIndex, mergeValue);
                toBeRemoveds.push(neighbour);
                match = true;
            }
        }
        for (let toBeRemoved of toBeRemoveds) {
            this.remove(toBeRemoved);
        }
        if (!match) {
            this.subTurn();
        }
    }

    crush(boardIndex: BoardIndex): void {
        if (this.special > 0 && this.state == State.Playing) {
            this.special--;
            this.changeStack.push(boardIndex);
            this.remove(boardIndex);
            this.state = State.InTurn;
        }
    }


    isGameOver(): boolean {
        for (let c = 0; c < this.gameBoard.maxColumnCount; c++) {
            if (this.gameBoard.canPush(c, this.nextNumber)) {
                return false;
            }
        }
        return true;
    }

    remove(tobeRemoved: BoardIndex): void {
        const uppers: BoardIndex[] = this.gameBoard.remove(tobeRemoved);
        for (let boardIndex of uppers) {
            this.changeStack.push(boardIndex);
        }
        this.state = State.InTurn;
    }

    doRemove(tobeRemoved: BoardIndex): void {
        this.remove(tobeRemoved);
        while (this.state == State.InTurn) {
            this.subTurn();
        }
    }

    getLessThanMin(): BoardIndex | null {
        for (let c = 0; c < this.gameBoard.maxColumnCount; c++) {
            const boardColumn: number[] = this.gameBoard.getColumn(c);
            for (let r = 0; r < boardColumn.length; r++) {
                const boardIndex: BoardIndex = new BoardIndex(r, c);
                const value: number = this.gameBoard.getValue(boardIndex);
                if (value < this.inputMin) {
                    return boardIndex;
                }
            }
        }
        return null;
    }

    setNextNumber(): void {
        this.nextNumber = Tools.dice(this.inputMin, this.inputMax);
    }

    copy(): Game {
        const game = new Game();
        game.currentMaxValue = this.currentMaxValue;
        game.distinctNumberCount = this.distinctNumberCount;
        game.inputMax = this.inputMax;
        game.nextNumber = this.nextNumber;
        game.score = this.score;
        game.special = this.special;
        game.state = this.state;
        game.gameBoard = this.gameBoard.copy();
        return game;
    }

    getBoard(): number[][] {
        return this.gameBoard.getRowBasedBoard();
    }

}




