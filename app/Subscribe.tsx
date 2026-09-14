// Buttondown signup — a plain form POST, no client JS. Buttondown handles
// confirmation and unsubscribe.
const BUTTONDOWN_USERNAME = 'silbaugh';

export default function Subscribe() {
  return (
    <section className="subscribe">
      <p className="subscribe-pitch">
        I keep a work diary: what I built, what broke, what it taught
        me. The full thing goes out by email.
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
