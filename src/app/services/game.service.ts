import { Tile } from '../models/tile';
import { Player } from '../models/player';
import { Injectable } from '@angular/core';
import { ModalService } from './modal.service';

@Injectable()
export class GameService {
  tiles: Tile[];
  gameTurn: Player;
  endGame: boolean;
  winner: Player;

  players: Player[];
  occupiedBlock: number;

  constructor(
    private modalService: ModalService
    ) {
  }

  initTiles(): void {
    this.tiles = [];
    this.occupiedBlock = 0;
    for (let i = 0; i < 9; i++) {
      const tile = new Tile(true, '');
      this.tiles.push(tile);
    }
  }

  initPlayers(): void {
    this.players = [];
    this.players.push(new Player('X', 'Player 1', 0));
    this.players.push(new Player('O', 'Player 2', 0));
  }

  handleMove(item: Tile): void {
    if (item.empty) {
      item.value = this.gameTurn.sign;
      this.occupiedBlock++;
      item.empty = false;
      this.endGame = this.checkIfWin(this.tiles);
      this.winner = this.gameTurn;
      this.saveToLocalStorage();
      this.changeTurn();
    }
    if (this.endGame) {
      this.winner.winNumber++;
      localStorage.setItem('gameStats', JSON.stringify(this.players));
      this.handleAfterEndGame('win-modal', 'gameState');
    } else if (this.occupiedBlock > 8) {
      this.handleAfterEndGame('draw-modal', 'gameState');
    }
  }

  changeTurn(): void {
    this.gameTurn.sign === 'X' ? this.gameTurn = this.players[1] : this.gameTurn = this.players[0];
  }

  checkIfWin(tiles: Tile[]): boolean {
    const victoryConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
       [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
       [0, 4, 8], [2, 4, 6], // diagonals
     ];
    for (const condition of victoryConditions) {
      if (!tiles[condition[0]].empty && tiles[condition[0]].value === tiles[condition[1]].value
        && tiles[condition[1]].value === tiles[condition[2]].value) {
          return true;
      }
    }
  }

  newGame(): void {
    this.gameTurn = this.players[0];
    this.initTiles();
  }

  saveToLocalStorage() {
    const saved = {
      game: this.tiles,
      turn: this.gameTurn,
      occupied: this.occupiedBlock
    };
    localStorage.setItem('gameState', JSON.stringify(saved));
  }

  loadFromLocalStorage() {
    const savedGame = JSON.parse(localStorage.getItem('gameState'));
    this.tiles = savedGame.game;
    this.gameTurn = savedGame.turn;
    this.occupiedBlock = savedGame.occupied;
  }

  handleAfterEndGame(modal: string, localStorageItem: string) {
    this.modalService.open(modal);
    localStorage.removeItem(localStorageItem);
    this.newGame();
  }
}
