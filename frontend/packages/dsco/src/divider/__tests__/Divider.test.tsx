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

  it('applies the no margin class by default', () => {
    render(<Divider />);
    const dividerElement = screen.getByRole('separator');
    expect(dividerElement).toHaveClass('divider-margin-none');
  });

  it('applies the small margin class when margin prop is small', () => {
    render(<Divider margin="small" />);
    const dividerElement = screen.getByRole('separator');
    expect(dividerElement).toHaveClass('divider-margin-small');
  });

  it('applies the medium margin class when margin prop is medium', () => {
    render(<Divider margin="medium" />);
    const dividerElement = screen.getByRole('separator');
    expect(dividerElement).toHaveClass('divider-margin-medium');
  });

  it('applies the large margin class when margin prop is large', () => {
    render(<Divider margin="large" />);
    const dividerElement = screen.getByRole('separator');
    expect(dividerElement).toHaveClass('divider-margin-large');
  });

  it('applies the extra-large margin class when margin prop is extra-large', () => {
    render(<Divider margin="extra-large" />);
    const dividerElement = screen.getByRole('separator');
    expect(dividerElement).toHaveClass('divider-margin-extra-large');
  });
});
