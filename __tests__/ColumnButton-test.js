import React from 'react';
import ColumnButton from '../Components/ColumnButton';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  const tree = renderer
        .create(<ColumnButton column={0} isGameOver={true}/>)
        .toJSON();
  expect(tree).toMatchSnapshot();
})
