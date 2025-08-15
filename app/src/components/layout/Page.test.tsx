import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Page } from './Page';

describe('Page', () => {
  it('renders with main landmark role', () => {
    render(
      <Page>
        <div>Test content</div>
      </Page>
    );
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
  
  it('renders children content', () => {
    render(
      <Page>
        <div>Test content</div>
      </Page>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  it('includes screen reader only title when provided', () => {
    render(
      <Page title="Test Title">
        <div>Content</div>
      </Page>
    );
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent('Test Title');
    expect(title).toHaveClass('sr-only');
  });
});