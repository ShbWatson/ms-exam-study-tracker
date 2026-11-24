import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { formatClock } from './clock';
import { StudyOwl } from './StudyOwl';

describe('StudyOwl clock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 23, 14, 5, 30));
  });
  afterEach(() => vi.useRealTimers());

  it('shows the current local time and advances each minute', () => {
    const { container } = render(<StudyOwl />);
    expect(container.textContent).toContain(formatClock(new Date(2026, 10, 23, 14, 5)));

    act(() => vi.advanceTimersByTime(30_000)); // reach 14:06:00
    expect(container.textContent).toContain(formatClock(new Date(2026, 10, 23, 14, 6)));

    act(() => vi.advanceTimersByTime(60_000)); // 14:07
    expect(container.textContent).toContain(formatClock(new Date(2026, 10, 23, 14, 7)));
  });
});
