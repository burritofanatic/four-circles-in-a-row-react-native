import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import * as Animatable from 'react-native-animatable';
import ColumnButton from "../Components/ColumnButton";
import * as Constants from '../Constants';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const NUMBER_OF_ROWS = Constants.NUMBER_OF_ROWS;
const WIDTH_OF_BOARD_TO_SCREEN = Constants.WIDTH_OF_BOARD_TO_SCREEN;

class ConnectBoard extends Component {

  onColumnClicked = (column) =>  {
    this.props.onColumnClicked(column);
  }

  onColumnPressedIn = (column) =>  {
    this.setState({ activeColumn: column });
  }

  returnButtonForRow = (value, row, col) => {
    /*This function determines the color of the botton to populate on the position based on the existing value from the 2D array. */

    switch (value) {
      case 1:
        return <View key={row, col} style={styles.buttonContainerOne} />;
      case 2:
        return <View key={row, col} style={styles.buttonContainerTwo} />;
      default:
        return <View key={row, col} style={styles.buttonContainerEmpty} />;
    }
  }

  returnOffsetForIndex = (index) => {
    if (index == 0) {
      return 0;
    } else {
      return ((width * WIDTH_OF_BOARD_TO_SCREEN) / NUMBER_OF_ROWS) * index;
    }
  }

  returnRows = (board) => {
    return board.map((row, rowIndex) => {
      return <View key={row + rowIndex} style={styles.row}>
        {row.map((value, colIndex) => {
          return this.returnButtonForRow(value, 0, colIndex)
        })
        }
      </View>
    })
  }

  render() {
    let board = this.props.board;
    let gameOver = this.props.gameOver;
    return (
      <Animatable.View animation='zoomIn' style={styles.board}>
        {
          board[0].map((value, colIndex) => {
            return <ColumnButton column={colIndex}
                      isGameOver={gameOver}
                      onColumnClicked={this.onColumnClicked}
                      key={"column-button-0-" + colIndex}
                      offset={{left: this.returnOffsetForIndex(colIndex)}}
                      onColumnPressedIn={this.onColumnPressedIn}/>
          })
        }

        { this.returnRows(board) }
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  board: {
    flex: 1,
    backgroundColor: 'skyblue',
    borderRadius: 25,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainerOne: {
    borderRadius: 25,
    width: (width * WIDTH_OF_BOARD_TO_SCREEN) / NUMBER_OF_ROWS,
    height: (width * WIDTH_OF_BOARD_TO_SCREEN) / NUMBER_OF_ROWS,
    backgroundColor: 'red'
  },
  buttonContainerTwo: {
    borderRadius: 25,
    width: (width * WIDTH_OF_BOARD_TO_SCREEN) / NUMBER_OF_ROWS,
    height: (width * 0.8) / NUMBER_OF_ROWS,
    backgroundColor: 'black'
  },
  buttonContainerEmpty: {
    borderRadius: 25,
    width: (width * WIDTH_OF_BOARD_TO_SCREEN) / NUMBER_OF_ROWS,
    height: (width * WIDTH_OF_BOARD_TO_SCREEN) / NUMBER_OF_ROWS,
    backgroundColor: 'white'
  },
})

export default ConnectBoard;
