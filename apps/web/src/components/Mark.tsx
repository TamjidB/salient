/** Salient's mark: a checked form box. */
export function Mark() {
  return (
    <svg className="mark" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <rect className="mark-box" x="0.75" y="0.75" width="18.5" height="18.5" rx="1.5" />
      <rect className="mark-fill" x="5" y="5" width="10" height="10" />
    </svg>
  );
}
