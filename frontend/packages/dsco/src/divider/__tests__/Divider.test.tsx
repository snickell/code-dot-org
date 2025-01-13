import {render, screen} from '@testing-library/react';
import {Divider} from '../';

describe('Divider Component', () => {
  it('renders Divider component', () => {
    render(<Divider />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies the primary color class by default', () => {
    render(<Divider />);
    const dividerElement = screen.getByRole('separator');
    expect(dividerElement).toHaveClass('divider-primary');
  });

  it('applies the strong color class when color prop is strong', () => {
    render(<Divider color="strong" />);
    const dividerElement = screen.getByRole('separator');
    expect(dividerElement).toHaveClass('divider-strong');
  });
});
