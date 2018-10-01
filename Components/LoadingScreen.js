import React, {Component} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import * as Animatable from 'react-native-animatable';
var Spinner = require('react-native-spinkit');
var width = Dimensions.get('window').width; // full screen width
var height = Dimensions.get('window').height; // full screen height
var reactMixin = require('react-mixin');
import TimerMixin from 'react-timer-mixin';

class LoadingScreen extends Component {

  constructor(props) {
    super(props)

    this.state = {
      textIndex: 0,
      textArray: ['We found you a seat, and are waiting for someone to join.', "Did you know that that the game is also called 'The Captain's Mistress' in reference to Captain Cook?",
      'In the Soviet Union, the game was called Gravitrips.', 'The game is a solved game, in that the player who moves first can always win by playing the correct moves', 'We found you a seat, and are waiting for someone to join you.', '🎵 Can anybody find me somebody to love?', 'Ooh, each morning I get up I die a little...', 'Can barely stand on my feet...', 'Take a look in the mirror and cry...', 'I have spent all my years in believing you...', 'Can anybody find me somebody to love?...'],
      text: 'We found you a seat, and are waiting for someone to join.'
    }
  }

  componentDidMount() {
    this.iterateText(0);
  }

  iterateText = (index) => {
    if (!this.props.shouldDisplay) return;
    let textArray = this.state.textArray;
    TimerMixin.setTimeout(
      () => {
        this.setState({
          text: textArray[index],
        })

        index++;
        if (index == textArray.length) index = 0; // Start over when going out of bounds.
        this.iterateText(index)
            },
      5000
    );
  }

  render() {
    let textIndex = this.state.textIndex;
    let shouldDisplay = this.props.shouldDisplay;

    return(
      <View style={shouldDisplay ? styles.loading : styles.inPlay}>
        <Animatable.Text animation='bounce' style={styles.titleText} iterationCount='infinite' easing="ease-out">Four Circles</Animatable.Text>
        <Animatable.Text delay={150} animation='rubberBand' easing="ease-out" iterationCount={3} style={styles.titleText}>In a Row!</Animatable.Text>

        <Spinner style={styles.spinner} isVisible={shouldDisplay ? true : false} size={80} type='9CubeGrid' color='#FFFFFF'/>

        <Animatable.Text animation='lightSpeedIn' delay={1000} style={styles.loadingText}>{this.state.text}</Animatable.Text>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  inPlay: {
    backgroundColor: 'transparent',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'skyblue',
    zIndex: 1000,
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
  },
  loading: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'skyblue',
    zIndex: 1000,
    position: 'absolute',
    width: width,
    height: height,
    alignItems: 'center',
  },
  titleText: {
    color: 'white',
    fontSize: 50,
    fontWeight: 'bold',
    top: height / 5,
    justifyContent: 'center'
  },
  spinner: {
    top: height / 4,
  },
  loadingText: {
    top: height / 3,
    width: width / 1.25,
    color: 'white',
    fontSize: 18,
    textAlign: 'center'
  },
  footerText: {
    color: 'white',
    fontSize: 12,
    bottom: 10
  }
})

export default LoadingScreen;
