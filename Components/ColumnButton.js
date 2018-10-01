import React, {Component} from 'react';
import {View, StyleSheet, TouchableHighlight, Dimensions} from 'react-native';

import * as Constants from '../Constants';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const WIDTH_OF_BOARD_TO_SCREEN = Constants.WIDTH_OF_BOARD_TO_SCREEN;
const NUMBER_OF_ROWS = Constants.NUMBER_OF_ROWS;

/*
 * The ColumnButton acts as an overlay that detects which column the user wants
 * to put his or her button in. The offset is passed in as a prop for the layout
 * along with the column value so that we can pass the result back.
 */
class ColumnButton extends Component {
  constructor(props) {
    super(props);
  }

  handleClick = () => {
    this.props.onColumnClicked(this.props.column);
  }

  onPressIn = () => {
    this.props.onColumnPressedIn(this.props.column);
  }

  render() {
    return (
      <TouchableHighlight style={[this.props.offset, styles.genericLayout]}
                          disabled={this.props.isGameOver}
                          onPress={this.handleClick}
                          onPressIn={this.onPressIn}>
        <View style={[this.props.offset, styles.genericLayout]} />
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  genericLayout: {
    position: 'absolute',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    width: (width * WIDTH_OF_BOARD_TO_SCREEN) / NUMBER_OF_ROWS,
    top: 0,
    bottom: 0,
    zIndex: 10,
    opacity: 0.5
  }
});

export default ColumnButton;
