import React from 'react';
import HistoryScreen from '../Components/HistoryScreen';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer
        .create(<HistoryScreen />)
        .toJSON();
  expect(tree).toMatchSnapshot();
})
