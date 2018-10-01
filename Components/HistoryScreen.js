import moment from 'moment';

import React, {Component} from 'react';

import {StyleSheet, Text, View, RefreshControl, ScrollView,
        Alert, TouchableHighlight,
        Dimensions, FlatList, TouchableOpacity, Image} from 'react-native';

import * as Constants from '../Constants';
import ConnectBoard from './ConnectBoard';
import TimerMixin from 'react-timer-mixin';
import DataManager from '../Http/DataManager';
import StoreManager from '../Managers/StoreManager';

const baseUrl = Constants.baseUrl;
const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

class HistoryScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = { games: [], refreshing: false }
    this.storeManager = new StoreManager();
    this.dataManager = new DataManager();
  }

  componentDidMount() {

    this.storeManager.retrieveItem('uuid').then((uuidFromStore) => {
      this.setState({ id: uuidFromStore });
      this.fetchGameHistory(uuidFromStore);
    });
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.fetchGameHistory(this.state.id);
  }

  fetchGameHistory = (uuid) => {
    this.dataManager.fetchGameHistory(uuid)
                    .then((listOfGames) => {
                      this.setState({refreshing: false});
                      if (listOfGames != null) {
                        // Set the state with the history of games for the user
                        listOfGames = listOfGames.map(item => Object.assign({}, item, {key: item.id }))
                                                  .map(item => Object.assign({}, item, {date: this.convertMongoDBIdDate(item.id)}))
                                                  .map(item => Object.assign({}, item, {
                                                    won: item.winner_id == uuid
                                                  }))

                        this.setState({ games: listOfGames })
                      } else {
                        this.setState({ games: [] })
                      }
                    })
                    .catch((error) => console.log(error));
  }



  convertMongoDBIdDate = (id) => {
    let timestamp = id.substring(0, 8);
    return new Date(parseInt(timestamp, 16) * 1000);
  }

  _renderItem = ({item, index}) => {
    return <HistoryGameListItem
              itemNumber={index + 1}
              id={item.id}
              isTie={item.winner == "3"}
              won={item.won}
              title={moment(item.date).fromNow()}
              board={item.board_states}/>
  }

  returnHistoryContent = (games) => {
    if (games.length > 0) {
      return <FlatList style={{ marginTop: 40, cellPadding: 10}}
        data={this.state.games}
        renderItem={this._renderItem}
        ItemSeparatorComponent={this.renderSeparator}/>;
    } else {
      return <View><Text style={[styles.noItemsText, styles.listItemText]}>You have no history of games. You can also try pulling to refresh this screen.</Text></View>;
    }
  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#CED0CE"
        }}
      />
    );
  };

  render() {
    return (
      <View>
        <ScrollView style={styles.historyScreen}
                    refreshControl={
                                    <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh}/>}>

          { this.returnHistoryContent(this.state.games) }

          <View style={{height: 100}}></View>
        </ScrollView>
      </View>
    );
  }
}

class HistoryGameListItem extends React.Component {
  constructor(props) {
    super(props)

    // Set the state of the board to the last initially.
    this.state = {board: props.board[props.board.length - 1]}
  }

  _onPress = () => {
    this.triggerStatePlayForGame(this.props.board, 0)
  }

  triggerStatePlayForGame = (boardStates, index) => {
    TimerMixin.setTimeout(
      () => {

        console.log("trigger: ", index);
        this.setState({
          board: boardStates[index],
        })

        index++;
        if (index == boardStates.length) return
        this.triggerStatePlayForGame(boardStates, index)
            },
      250
    );
  }

  returnGameResult = () => {
    if (this.props.isTie) {
      return 'you tied';
    } else {
      if (this.props.won) {
        return 'you won';
      } else {
        return 'you lost';
      }
    }
  }

  render() {
    return(
      <TouchableOpacity onPress={this._onPress}>
        <View style={styles.listItemView}>
          <Text style={styles.listItemText}>{this.props.itemNumber}. </Text>
          <View></View>
          <Text style={styles.listItemText}>Game {this.returnGameResult()} from {this.props.title}</Text>
          <Image style={{ position: 'absolute', left: 0, bottom: 0,
          zIndex: 11}} source={require('../img/play.png')}/>
          <ConnectBoard board={this.state.board} gameOver={true} />
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
    // History
    historyScreen: {
      backgroundColor: 'black',
      width: width,
      height: height
    },

    // List Item View
    listItemView: {
      height: width,
      width: width,
      flex: 1,
      flexDirection: 'column'
    },

    listItemText: {
      color: 'white',
      fontSize: 18
    },
    noItemsText: {
      padding: 40,
      marginTop: 20
    }
});

export default HistoryScreen;
