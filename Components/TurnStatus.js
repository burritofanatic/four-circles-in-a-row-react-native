import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import * as Animatable from 'react-native-animatable';

class TurnStatus extends Component {

  render() {
    let text;
    if (this.props.gameOver) {
      if (this.props.winner == 3) {
        text = 'Tied!';
      } else if (this.props.userIsWinner) {
        text = 'You Win!';
      } else {
        text = 'You Lose!';
      }
    } else {
      if (this.props.isTurn) {
        text = 'Your Turn!';
      } else {
        text = 'Their Turn!';
      }
    }

    return (
        <Animatable.Text style={styles.alertText}
                      animation='pulse' easing='ease-out'
                      iterationCount='infinite'>{text}
                      </Animatable.Text>
    );
  }
}

const styles = StyleSheet.create({
  alertText: {
    color: 'white',
    fontSize: 40
  }
});

export default TurnStatus;
