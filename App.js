import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View,
        Button, Alert, TouchableHighlight,
        TouchableWithoutFeedback, AsyncStorage,
        Dimensions, Modal, FlatList,
        TouchableOpacity, TextInput, AppState} from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import UUID from 'uuid/v1';
import TurnStatus from './Components/TurnStatus';
import LoadingScreen from './Components/LoadingScreen';
import ConnectBoard from './Components/ConnectBoard';
import HistoryScreen from './Components/HistoryScreen';
import * as Animatable from 'react-native-animatable';
import * as Constants from './Constants';
import DataManager from './Http/DataManager';
import StoreManager from './Managers/StoreManager';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const baseUrl = Constants.baseUrl;
const baseWebSocket = Constants.baseWebSocket;

const WIDTH_OF_BOARD_TO_SCREEN = Constants.WIDTH_OF_BOARD_TO_SCREEN;

type Props = {};

const initialState = { id: '',
              board: [[0,0,0,0,0,0,0],
                      [0,0,0,0,0,0,0],
                      [0,0,0,0,0,0,0],
                      [0,0,0,0,0,0,0],
                      [0,0,0,0,0,0,0],
                      [0,0,0,0,0,0,0]],
              buttonColor: 'red',
              winner: 0,
              textToSend: '',
              appState: AppState.currentState
            };
export class App extends Component<Props> {

  constructor(props) {
    super(props)

    this.storeManager = new StoreManager();
    this.dataManager = new DataManager();

    this.state =  initialState
  }

  componentDidMount() {
    this.fetchOrCreateUUID();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
  if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
    this.fetchOrCreateUUID();
  }
  this.setState({appState: nextAppState});
}

  async fetchOrCreateUUID() {
    try {
      const uuidFromStore = await this.storeManager.retrieveItem('uuid')

      let uuid;
      if (uuidFromStore !== null) {
        uuid = uuidFromStore;
      } else {
        uuid = UUID();
        this.storeManager.storeItem('uuid', uuid);
      }
      this.setState({ id: uuid });

      // Attempt to connect to websocket with the uuid:
      this.startWebSocket(uuid);
    } catch (error) {
      console.log(error);
    }
  }


  // Websocket
  startWebSocket = (uuid) => {
    this.dataManager.startWebSocket(uuid, (response) => {
      this.handleMessage(response, uuid);
    })
  }

  reopenWS = () => {
    this.startWebSocket(this.state.id);
  }

  handleMessage = (message, uuid) => {
    if (message.playerIdMap['1'] == uuid) {
      this.setState({ buttonColor: 'red' });
      this.setState({ playerId: 1 });
    } else {
      this.setState({ buttonColor: 'black' });
      this.setState({ playerId: 2 });
    }

    this.handleRematchRequestMap(message.requestRematchMap);

    this.setState(message);
  }

  handleRematchRequestMap = (rematch) => {
    var size = Object.keys(rematch).length;
    if (rematch[this.state.id] != true && size == 1) {
      Alert.alert(
        'Rematch!',
        'Your opponent has requested a rematch. Would you like to play again?',
        [
          {text: 'Yes', onPress: () => this.onRematchButtonClicked()},
          {text: 'No, Leave Room', onPress: () => this.onLeaveRoomButtonClicked()},
        ],
        { cancelable: false }
      )
    }
  }

  // Game actions
  makeMove = (column) => {
    let playerId = this.state.playerId;
    let uuid = this.state.id;
    let room = this.state.room;

    this.dataManager.makeMove(column, playerId, uuid, room).then((response) => {
      // Handle error message.
      if (typeof response == 'string') {
          Alert.alert(response);
      }
    })
  }

  // Force loss and leave room.
  forceLoss = () => {
    let playerId = this.state.playerId;
    let uuid = this.state.id;
    let room = this.state.room;

    this.dataManager.forceLoss(playerId, uuid, room).then((response) => {
      this.leaveRoom();
    })
  }

  sendMessage = (message) => {
    this.dataManager.sendMessage(message, this.state.room, this.state.id).then(() => {
      this.setState({ textToSend: '' });
    })
  }

  onColumnClicked = (column) =>  {
    console.log('column clicked: ' + column );
    if (this.isTurn()) {
      this.makeMove(column)
    }
  }

  isTurn = () => { return this.state.turn == this.state.playerId }

  onRematchButtonClicked = () => {
    let playerId = this.state.playerId;
    let uuid = this.state.id;
    let room = this.state.room;

    this.dataManager.rematch(playerId, uuid, room).then((responseJson) => {
      var size = Object.keys(responseJson).length;

      // Show the alert that the rematch request as been made.
      if (responseJson[uuid] && size == 1) {
        Alert.alert("Your rematch request has been sent to your opponent. A new game will start when they accept.");
      }
    });
  }

  onLeaveRoomButtonClicked = () => {
    // Show the alert to confirm the consequences of leaving a room in play
    if (this.state.inPlay) {
      this.showForfeitWarning();
    } else {
      this.leaveRoom();
    }
  }

  leaveRoom = () => {
    let playerId = this.state.playerId;
    let uuid = this.state.id;
    let room = this.state.room;

    this.dataManager.leaveRoom(playerId, uuid, room).then((response) => {
                      if (typeof response == 'string') {
                        Alert.alert(response);
                      } else {
                        this.reopenWS()
                      }
                    });
  }

  showForfeitWarning() {
    Alert.alert(
      'Warning!',
      'By leaving a game while in session, you forfeit a loss. Do you still want to leave?',
      [
        {text: 'Yep!', onPress: () => {
            this.forceLoss();
        }},
        {text: 'Cancel', style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  areBothSeatsOccupied = () => {
    return 2 == Object.keys(this.state.playerIdMap).length;
  }

  isThereWinner = () => {
    return this.state.winner != 0;
  }

  handleRematchButton = () => {
    let inPlay = this.state.inPlay;
    let winner = this.state.winner;

    // Show rematch when the game is no longer in play, and there is a winner.
    if (this.isThereWinner() && this.areBothSeatsOccupied()) {
      return <TouchableHighlight key='rematch-button'
                        onPress={this.onRematchButtonClicked}>
                        <View style={[styles.actionButtons, styles.rematchButton]}><Text style={styles.actionButtonsText}>Rematch!</Text></View>
                      </TouchableHighlight>;
    }
    return <View/>;
  }

  render() {
    let board = this.state.board;
    let activeColumn = this.state.activeColumn;
    let itemReleased = this.state.itemReleased;
    let gameOver = this.isThereWinner();
    let playerId = this.state.playerId;
    let winner = this.state.winner;
    let userIsWinner = (winner == playerId);
    let promptText;
    let userScore = playerId == 1 ? this.state.scoreOne : this.state.scoreTwo;
    let oppScore = playerId == 1 ? this.state.scoreTwo : this.state.scoreOne;
    let inPlay = this.state.inPlay;
    let rematchButton = this.handleRematchButton();
    let isTurn = this.isTurn();
    let shouldDisplayLoadingScreen = (!inPlay && !gameOver)

    return (
      <View style={styles.container}>
        <LoadingScreen shouldDisplay={shouldDisplayLoadingScreen} />

        <View style={{ height: 10 }} />

        <View style={styles.spacingTop}/>
        <Text style={[styles.yourScoreLabel, styles.scoresLabel]}>
          Your Score: {userScore}
        </Text>
        <Text style={[styles.theirScoreLabel, styles.scoresLabel]}>
          Opponent's Score: {oppScore}
        </Text>
        { promptText }

        <View style={{ flexDirection: 'row'}}>
          <TextInput
            style={{height: 40, width: width * WIDTH_OF_BOARD_TO_SCREEN,
              backgroundColor: 'white', borderRadius: 5}}
            placeholder="Chat here!"
            value={this.state.textToSend}
            onChangeText={(text) => this.setState({textToSend: text})}
            onSubmitEditing={() => this.sendMessage(this.state.textToSend)}
            returnKeyType={'send'}
          />
        </View>

        <Text style={{ color: 'skyblue', fontSize: 14, fontWeight: 'bold' }}>
          {this.state.message}
        </Text>
        <TurnStatus gameOver={gameOver} winner={winner} userIsWinner={userIsWinner} isTurn={isTurn}/>
        <View style={{ width: width * WIDTH_OF_BOARD_TO_SCREEN, height: width * 0.7 }}>
          <ConnectBoard board={board} gameOver={gameOver} onColumnClicked={this.onColumnClicked}/>
        </View>
        <View style={styles.rematchActionView}>
          { rematchButton }
          <Button onPress={this.onLeaveRoomButtonClicked} title="Leave Room" color="skyblue" />
        </View>
      </View>
      );
    }
};


export default createBottomTabNavigator(
  {
  'Game': App,
  'Game History': HistoryScreen
  },
  {
    tabBarOptions: {
      activeTintColor: 'skyblue',
      inactiveTintColor: 'white',
      labelStyle: {
        fontSize: 16,
        bottom: 10
      },
      style: {
        backgroundColor: 'black',
      },
    },
  }
);

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'black',
      alignItems: 'center',

    },
    showHistory: {
      borderRadius: 15,
      color: 'black',
      backgroundColor: 'white',
      height: 35,
      justifyContent: 'center',
      position: 'relative',
      top: 10
    },
    spacingTop: {
      height: height / 10
    },
    rematchActionView: {
      flexDirection: 'column',
      width: width,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10
    },
    scoresLabel: {
      top: 40
    },
    yourScoreLabel: {
      color: 'white',
      position:'absolute',
      left: 30,
      fontSize: 15
    },
    theirScoreLabel: {
      color: 'white',
      position:'absolute',
      right: 30,
      fontSize: 15
    },
    actionButtons: {
      width: width / 2,
      height: 35,
      borderRadius: 5
    },
    rematchButton: {
      position: 'relative',
      backgroundColor: 'skyblue',
      marginBottom: 10
    },
    leaveRoomButton: {
      position: 'relative',
      backgroundColor: 'red'
    },
    actionButtonsText: {
      justifyContent: 'center',
      color: 'white',
      alignItems: 'center',
      alignSelf: 'center',
      fontSize: 24,
    }
});
