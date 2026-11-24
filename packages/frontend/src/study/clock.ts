/** Local wall-clock time in the viewer's own format (e.g. "3:07 PM" or "15:07"). */
export function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
