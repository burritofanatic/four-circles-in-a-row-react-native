import React from 'react';
import LoadingScreen from '../Components/LoadingScreen';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer
        .create(<LoadingScreen shouldDisplay={true}/>)
        .toJSON();
  expect(tree).toMatchSnapshot();
})
