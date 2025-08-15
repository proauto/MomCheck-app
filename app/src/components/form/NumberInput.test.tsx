import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
  it('renders with label and placeholder', () => {
    render(
      <NumberInput
        label="Test Label"
        placeholder="Enter number"
        onChange={vi.fn()}
      />
    );
    
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter number')).toBeInTheDocument();
  });
  
  it('displays suffix when provided', () => {
    render(
      <NumberInput
        label="Weight"
        suffix="kg"
        onChange={vi.fn()}
      />
    );
    
    expect(screen.getByText('kg')).toBeInTheDocument();
  });
  
  it('calls onChange with number value', () => {
    const handleChange = vi.fn();
    render(
      <NumberInput
        label="Test"
        onChange={handleChange}
      />
    );
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '42' } });
    
    expect(handleChange).toHaveBeenCalledWith(42);
  });
  
  it('has proper accessibility attributes', () => {
    render(
      <NumberInput
        label="Height"
        min={120}
        max={210}
        onChange={vi.fn()}
      />
    );
    
    const input = screen.getByLabelText('Height');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '120');
    expect(input).toHaveAttribute('max', '210');
  });
});