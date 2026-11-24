import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ExamSummary, Skill } from '@/lib/study-data';

// Test fixtures only — the app itself never shows invented rows.
const skill = (n: number, domain: number, sub: number): Skill => ({
  key: `k${n}`,
  exam: 'DP-600',
  domainNumber: domain,
  domainName: domain === 1 ? 'Maintain a data analytics solution' : 'Prepare data',
  weightMin: domain === 1 ? 25 : 45,
  weightMax: domain === 1 ? 30 : 50,
  subcategoryNumber: sub,
  subcategory: `Sub ${sub}`,
  skillNumber: n,
  text: `Skill ${n}`,
});

const api = vi.hoisted(() => ({
  listSkills: vi.fn(),
  listProgress: vi.fn(),
  saveProgress: vi.fn(),
}));
vi.mock('@/lib/study-data', () => api);

import { ExamView } from './ExamView';

const exam: ExamSummary = {
  code: 'DP-600',
  title: 'Implementing Analytics Solutions Using Microsoft Fabric',
  studyGuideUrl: null,
  skillCount: 3,
  domainCount: 2,
  lastSynced: null,
};

describe('ExamView', () => {
  beforeEach(() => {
    window.localStorage.clear();
    api.listSkills.mockResolvedValue([skill(1, 1, 1), skill(2, 1, 1), skill(3, 2, 2)]);
    api.listProgress.mockResolvedValue([{ id: 'p1', skillKey: 'k1', status: 'confident', updatedAt: null }]);
    api.saveProgress.mockReset();
  });

  it('shows weighted domains and existing progress', async () => {
    render(<ExamView exam={exam} onBack={() => {}} />);
    expect(await screen.findByText('25–30%')).toBeInTheDocument();
    expect(screen.getByText('45–50%')).toBeInTheDocument();
    const row = screen.getByRole('radiogroup', { name: 'Status for Skill 1' });
    expect(within(row).getByRole('radio', { name: 'Confident' })).toHaveAttribute('aria-checked', 'true');
  });

  it('creates progress for an untouched skill', async () => {
    api.saveProgress.mockResolvedValue({ id: 'p3', skillKey: 'k3', status: 'studying', updatedAt: new Date() });
    render(<ExamView exam={exam} onBack={() => {}} />);
    const row = await screen.findByRole('radiogroup', { name: 'Status for Skill 3' });
    fireEvent.click(within(row).getByRole('radio', { name: 'Studying' }));
    await waitFor(() => expect(api.saveProgress).toHaveBeenCalledWith('DP-600', 'k3', 'studying', undefined));
    expect(within(row).getByRole('radio', { name: 'Studying' })).toHaveAttribute('aria-checked', 'true');
  });

  it('updates an existing row and rolls back when the save fails', async () => {
    api.saveProgress.mockRejectedValue(new Error('denied'));
    render(<ExamView exam={exam} onBack={() => {}} />);
    const row = await screen.findByRole('radiogroup', { name: 'Status for Skill 1' });
    fireEvent.click(within(row).getByRole('radio', { name: 'Reviewed' }));
    await waitFor(() => expect(api.saveProgress).toHaveBeenCalledWith('DP-600', 'k1', 'reviewed', 'p1'));
    expect(await screen.findByText(/wasn't saved: denied/)).toBeInTheDocument();
    expect(within(row).getByRole('radio', { name: 'Confident' })).toHaveAttribute('aria-checked', 'true');
  });

  it('filters to one domain from the map', async () => {
    render(<ExamView exam={exam} onBack={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: /Prepare data/ }));
    expect(screen.queryByRole('radiogroup', { name: 'Status for Skill 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'Status for Skill 3' })).toBeInTheDocument();
  });

  it('filters skills by status', async () => {
    render(<ExamView exam={exam} onBack={() => {}} />);
    const group = await screen.findByRole('group', { name: 'Filter skills by status' });
    fireEvent.click(within(group).getByRole('button', { name: /Confident/ }));
    expect(screen.getByRole('radiogroup', { name: 'Status for Skill 1' })).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: 'Status for Skill 2' })).not.toBeInTheDocument();
    fireEvent.click(within(group).getByRole('button', { name: /Clear/ }));
    expect(screen.getByRole('radiogroup', { name: 'Status for Skill 2' })).toBeInTheDocument();
  });

  it('shows a 0–100% progress bar on each card', async () => {
    render(<ExamView exam={exam} onBack={() => {}} />);
    const bar = await screen.findByRole('progressbar', { name: '1 of 2 confident' });
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });

  it('celebrates when a domain becomes fully confident', async () => {
    api.saveProgress.mockResolvedValue({ id: 'p2', skillKey: 'k2', status: 'confident', updatedAt: new Date() });
    render(<ExamView exam={exam} onBack={() => {}} />);
    const row = await screen.findByRole('radiogroup', { name: 'Status for Skill 2' });
    fireEvent.click(within(row).getByRole('radio', { name: 'Confident' }));
    expect(await screen.findByText('Domain conquered')).toBeInTheDocument();
    expect(screen.getByText(/skills? moved forward today/)).toBeInTheDocument();
  });

  it('shows a study-break joke and swaps it on demand and on progress', async () => {
    api.saveProgress.mockResolvedValue({ id: 'p3', skillKey: 'k3', status: 'studying', updatedAt: new Date() });
    render(<ExamView exam={exam} onBack={() => {}} />);
    const panel = await screen.findByRole('complementary', { name: 'Study break' });
    const first = within(panel).getByRole('blockquote').textContent;
    // One button for narrow layouts, one for wide; CSS shows only one at a time.
    fireEvent.click(within(panel).getAllByRole('button', { name: /Another one/ })[0]);
    await waitFor(() => expect(within(panel).getByRole('blockquote').textContent).not.toBe(first));
    const second = within(panel).getByRole('blockquote').textContent;
    const row = screen.getByRole('radiogroup', { name: 'Status for Skill 3' });
    fireEvent.click(within(row).getByRole('radio', { name: 'Studying' }));
    await waitFor(() => expect(within(panel).getByRole('blockquote').textContent).not.toBe(second));
  });

  it('hides the study break, remembers it, and can bring it back', async () => {
    const { unmount } = render(<ExamView exam={exam} onBack={() => {}} />);
    const panel = await screen.findByRole('complementary', { name: 'Study break' });
    fireEvent.click(within(panel).getByRole('button', { name: 'Hide study break' }));
    expect(screen.queryByRole('complementary', { name: 'Study break' })).not.toBeInTheDocument();
    unmount();

    render(<ExamView exam={exam} onBack={() => {}} />);
    fireEvent.click(await screen.findByRole('button', { name: /Show study break/ }));
    expect(screen.getByRole('complementary', { name: 'Study break' })).toBeInTheDocument();
  });
});
