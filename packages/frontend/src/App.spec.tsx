import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// The app reads from Fabric; keep tests offline with a client that never resolves.
vi.mock('@/lib/rayfin-client', () => ({
  getRayfinClient: () => new Promise(() => {}),
}));

import App from '@/App';

describe('App', () => {
  it('renders without throwing', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('opens on the exam picker', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /map the exam/i })).toBeInTheDocument();
  });

  it('opens the About page from the header and goes back to the exams', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'About' }));
    expect(screen.getByRole('heading', { name: /hi, i'm shabnam/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'About' })).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: /all exams/i }));
    expect(screen.getByRole('heading', { name: /map the exam/i })).toBeInTheDocument();
  });
});
