(function () {
   'use strict';
}());

import * as Constants from '../Constants';
import httpRequest from './RequestHelper';

const baseUrl = Constants.baseUrl;
const baseWebSocket = Constants.baseWebSocket;

export default class DataManager {
  constructor() {
    this.leaveUri = baseUrl + '/leave';
    this.historyUri = baseUrl + '/find';
    this.forceLossUri = baseUrl + '/resign';
    this.rematchUri = baseUrl + '/rematch';
    this.sendMessageUri = baseUrl + '/message';
    this.moveUri = baseUrl + '/move';
  }

  // Game Actions

  makeMove = (column, playerId, uuid, room) => {
    let body = JSON.stringify({
      col: column,
      player: new Number(playerId),
      room: room,
      playerId: uuid
    })
    return httpRequest(this.moveUri, 'POST', body);
  }

  leaveRoom = (playerId, uuid, room) => {
    let body = JSON.stringify({
      player: new Number(playerId),
      room: room,
      playerId: uuid
    })
    return httpRequest(this.leaveUri, 'POST', body);
  }

  forceLoss = (playerId, uuid, room) => {
    let body = JSON.stringify({
      player: new Number(playerId),
      room: room,
      playerId: uuid
    })
    return httpRequest(this.forceLossUri, 'POST', body);
  }

  rematch = (playerId, uuid, room) => {
    let body = JSON.stringify({
      player: new Number(playerId),
      room: room,
      playerId: uuid
    })
    return httpRequest(this.rematchUri, 'POST', body);
  }

  sendMessage = (message, room, uuid) => {
    let body = JSON.stringify({
      message: message,
      room: room,
      playerId: uuid
    })
    return httpRequest(this.sendMessageUri, 'POST', body);
  }

  // Websocket

  startWebSocket = (uuid, callback) => {
    var ws = new WebSocket(baseWebSocket + uuid);

    ws.onopen = () => {
      console.log('ws connected');
    };

    ws.onmessage = (e) => {
      let jsonData = {}
      try {
        console.log(e.data);
        jsonData = JSON.parse(e.data);
        callback(this.parseWSResponseAndSetStates(jsonData));
      } catch(error) {
        console.log(error);
      }
    };

    ws.onerror = (e) => {
      // an error occurred
      console.log(e.message);
    };

    ws.onclose = (e) => {
      // connection closed
      console.log(e.message);
    };
  }

  parseWSResponseAndSetStates = (jsonData) => {
    const playerIdMap = jsonData['PlayerId'];
    const board = jsonData['Board'];
    const turn = jsonData['Turn'];
    const scoreOne = jsonData['ScoreOne'];
    const scoreTwo = jsonData['ScoreTwo']
    const room = jsonData['Room'];
    const winner = jsonData['Winner'];
    const inPlay = jsonData['InPlay'];
    const turnCount = jsonData['TurnCount'];
    const message = jsonData['Message'];
    const isTied = jsonData['tied'];
    const requestRematchMap = jsonData['RematchRequest'];

    return {
      playerIdMap: playerIdMap,
      board: board,
      turn: turn,
      scoreOne: scoreOne,
      scoreTwo: scoreTwo,
      room: room,
      winner: winner,
      inPlay: inPlay,
      turnCount: turnCount,
      message: message,
      isTied: isTied,
      requestRematchMap: requestRematchMap
    };
  }

  // History

  fetchGameHistory = (uuid) => {
    let body = JSON.stringify({
      PlayerId: uuid
    })
    return httpRequest(this.historyUri, 'POST', body);
  }
}
