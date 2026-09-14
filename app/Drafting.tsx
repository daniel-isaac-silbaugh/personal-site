// Drawing-set furniture: dimension lines, detail bubbles, title blocks.
// These are the pieces that make the page read as a sheet from a set
// rather than a web page with a grid behind it.

/**
 * A dimension line: extension ticks at each end, the measurement sitting
 * in a gap in the middle. Drafting uses 45-degree slashes rather than
 * arrowheads on linear dimensions, which is what .dim-tick draws.
 */
export function Dim({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`dim ${className}`} aria-hidden="true">
      <span className="dim-tick" />
      <span className="dim-line" />
      <span className="dim-label">{label}</span>
      <span className="dim-line" />
      <span className="dim-tick" />
    </div>
  );
}

/**
 * The detail/section marker: a circle split by a horizontal rule, item
 * number above, sheet reference below.
 */
export function Bubble({ n, sheet }: { n: number; sheet: string }) {
  return (
    <span className="bubble">
      <span className="bubble-n">{String(n).padStart(2, '0')}</span>
      <span className="bubble-ref">{sheet}</span>
    </span>
  );
}

/** One labelled cell of a title block. */
function Cell({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={`tb-cell${wide ? ' tb-wide' : ''}`}>
      <span className="tb-label">{label}</span>
      <span className="tb-value">{value}</span>
    </div>
  );
}

/** The title block that closes every sheet. */
export function TitleBlock({
  sheet,
  title,
  date,
  total,
}: {
  sheet: string;
  title: string;
  date: string;
  total: string;
}) {
  return (
    <div className="titleblock">
      <Cell label="Project" value="Personal Works" wide />
      <Cell label="Sheet Title" value={title} wide />
      <Cell label="Drawn By" value="D.I.S." />
      <Cell label="Scale" value="1:1" />
      <Cell label="Date" value={date} />
      <Cell label="Rev" value="A" />
      <Cell label="Sheet" value={sheet} />
      <Cell label="Of" value={total} />
    </div>
  );
}
