import React from 'react';
import ConnectBoard from '../Components/ConnectBoard';
import renderer from 'react-test-renderer';

it('renders correctly', () => {

  const board = [[0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0]];

  const tree = renderer
        .create(<ConnectBoard board={board} gameOver={true} />)
        .toJSON();
  expect(tree).toMatchSnapshot();
})
