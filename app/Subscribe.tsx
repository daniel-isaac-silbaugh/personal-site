// Buttondown signup — a plain form POST, no client JS. Buttondown handles
// confirmation and unsubscribe.
const BUTTONDOWN_USERNAME = 'silbaugh';

export default function Subscribe() {
  return (
    <section className="subscribe">
      <p className="subscribe-pitch">
        Can a delivery driver build a company from scratch? Follow my journey
        day by day as I build things, make mistakes, figure things out, and
        try everything I can, all in real time. The full daily work diary is
        available by email only.
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
