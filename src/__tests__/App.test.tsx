import { render, screen } from '@testing-library/react';

import App from '../App';

it('renders App correctly and matches snapshot', () => {
  render(<App />);
  expect(screen.getByTestId('app')).toMatchSnapshot();
});
