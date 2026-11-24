import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', () => {
  it('keeps a custom font size next to a text colour', () => {
    expect(cn('text-300', 'text-muted-foreground')).toBe('text-300 text-muted-foreground');
    expect(cn('text-200 font-medium', 'text-foreground')).toBe('text-200 font-medium text-foreground');
    expect(cn('text-hero-700', 'text-primary')).toBe('text-hero-700 text-primary');
  });

  it('still resolves two sizes to the last one', () => {
    expect(cn('text-300', 'text-400')).toBe('text-400');
  });
});
