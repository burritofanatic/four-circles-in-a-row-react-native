import React from 'react';
import TurnStatus from '../Components/TurnStatus';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer
        .create(<TurnStatus winner={3} gameOver={true}/>)
        .toJSON();
  expect(tree).toMatchSnapshot();
})
