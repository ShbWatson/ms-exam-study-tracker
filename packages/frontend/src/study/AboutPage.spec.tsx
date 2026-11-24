import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ABOUT } from './about-content';
import { AboutPage } from './AboutPage';

describe('AboutPage', () => {
  it('shows the story, the how-it-works flow and only the links that have an address', () => {
    render(<AboutPage onBack={vi.fn()} />);

    expect(screen.getByRole('heading', { name: /hi, i'm shabnam/i })).toBeInTheDocument();
    expect(screen.getByText(ABOUT.story[0][0] as string)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /microsoft fabric community/i })).toHaveAttribute(
      'href',
      'https://community.fabric.microsoft.com/',
    );
    expect(screen.getByRole('complementary', { name: 'Important' })).toHaveTextContent(ABOUT.notice.title);
    for (const post of ABOUT.examStories) {
      expect(screen.getByRole('link', { name: new RegExp(post.exam) })).toHaveAttribute('href', post.href);
    }
    expect(screen.getByRole('heading', { name: /built with microsoft fabric/i })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(4);

    for (const link of ABOUT.links) {
      const el = screen.queryByRole('link', { name: new RegExp(`^${link.label}`, 'i') });
      if (link.href) {
        expect(el).toHaveAttribute('href', link.href);
        expect(el).toHaveAttribute('target', '_blank');
      } else {
        expect(el).toBeNull();
      }
    }
  });
});
