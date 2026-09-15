// Buttondown signup — a plain form POST, no client JS. Buttondown handles
// confirmation and unsubscribe.
//
// Two variants. "panel" is the standalone sidebar block with its pitch;
// "inline" is the compact field that sits beside the social links, for
// people who are already convinced and just want the box.
const BUTTONDOWN_USERNAME = 'silbaugh';

const ACTION = `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`;

export default function Subscribe({
  variant = 'panel',
}: {
  variant?: 'panel' | 'inline';
}) {
  if (variant === 'inline') {
    return (
      <form action={ACTION} method="post" className="subscribe-inline">
        <label className="subscribe-inline-label" htmlFor="sub-inline">
          Work diary, by email
        </label>
        <div className="subscribe-form">
          <input
            id="sub-inline"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />
          <button type="submit">Subscribe</button>
        </div>
      </form>
    );
  }

  return (
    <section className="subscribe">
      <p className="subscribe-pitch">
        I keep a work diary: what I built, what broke, and what it taught
        me.
      </p>
      <form action={ACTION} method="post" className="subscribe-form">
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          aria-label="Email address"
        />
        <button type="submit">Subscribe</button>
      </form>
    </section>
  );
}
