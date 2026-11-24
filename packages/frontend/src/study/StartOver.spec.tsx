import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const api = vi.hoisted(() => ({ resetAllProgress: vi.fn() }));
vi.mock('@/lib/study-data', () => api);

import { StartOver } from './StartOver';

describe('StartOver', () => {
  beforeEach(() => {
    // mockClear (not mockReset): a reset mock that later throws trips vitest even when the app handles it.
    api.resetAllProgress.mockClear();
    api.resetAllProgress.mockResolvedValue(0);
  });

  it('asks "Are you sure?" and does nothing on Cancel', () => {
    const onReset = vi.fn();
    render(<StartOver onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: /Start over/ }));
    expect(screen.getByRole('alertdialog', { name: 'Are you sure?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(api.resetAllProgress).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('closes on Escape without resetting', () => {
    render(<StartOver onReset={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Start over/ }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(api.resetAllProgress).not.toHaveBeenCalled();
  });

  it('resets everything after confirmation', async () => {
    api.resetAllProgress.mockResolvedValue(12);
    const onReset = vi.fn();
    render(<StartOver onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: /Start over/ }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Yes, reset everything' })));
    expect(api.resetAllProgress).toHaveBeenCalledTimes(1);
    expect(onReset).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('keeps the dialog open and explains a failure', async () => {
    api.resetAllProgress.mockImplementation(async () => {
      throw new Error('Reset removed 3 of 10 records. Try again to finish.');
    });
    const onReset = vi.fn();
    render(<StartOver onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: /Start over/ }));
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Yes, reset everything' })));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('3 of 10'));
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(onReset).not.toHaveBeenCalled();
  });
});
