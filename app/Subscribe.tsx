// Buttondown signup — a plain form POST, no client JS. Buttondown handles
// confirmation and unsubscribe. Set the username below after creating the
// account at buttondown.com.
const BUTTONDOWN_USERNAME = 'REPLACE_ME';

export default function Subscribe() {
  if (BUTTONDOWN_USERNAME === 'REPLACE_ME') return null; // hidden until wired

  return (
    <section className="subscribe">
      <p className="subscribe-pitch">
        I keep a public work diary — building a phone company, publishing old
        books, looking for work, in that order of honesty. New entries by
        email, nothing else.
      </p>
      <form
        action={`https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`}
        method="post"
        className="subscribe-form"
      >
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
