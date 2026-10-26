import { Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Contact, Prose } from "@/components/site/SiteChrome";
import { BUSINESS } from "@/content/business";

export const metadata: Metadata = { title: "Help & support" };

const QUESTIONS = [
  {
    q: "My purchase says “Processing”",
    a: "The network hasn't confirmed it yet. Your money is held, not spent, and the purchase settles by itself, usually within minutes: it's either delivered or refunded to your wallet. The receipt page updates on its own.",
  },
  {
    q: "I paid but my balance didn't go up",
    a: "Most payments are credited within a few minutes, even if you closed the payment page. If it's been longer, contact us with the Paystack reference from your receipt or bank alert.",
  },
  {
    q: "I sent airtime to the wrong number",
    a: "Once a network delivers to a number it can't be recalled, so we can't refund it. If the purchase failed, the money is already back in your wallet.",
  },
  {
    q: "I forgot my transaction PIN",
    a: "Set a new one in Account → Transaction PIN. You'll need your account password. After 5 wrong PINs, purchases pause for 30 minutes.",
  },
  {
    q: "I can't sign in",
    a: "Use “Forgot password?” on the sign-in page to get a reset code by email. Resetting your password signs you out everywhere else.",
  },
];

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const reference = ref && /^[\w\-:.]{1,64}$/.test(ref) ? ref : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Help &amp; support</h1>
      <p className="mt-2 max-w-2xl text-brand-ink/75">
        We&apos;re here {BUSINESS.supportHours}. We reply {BUSINESS.firstResponse}.
      </p>

      {reference && (
        <p className="mt-6 max-w-2xl rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          Asking about a purchase? Quote its reference: <span className="font-mono font-semibold">{reference}</span>
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
          <Mail className="h-6 w-6 text-brand-harbor" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">Email</h2>
          <p className="mt-1 text-sm text-brand-ink/75 [&_a]:font-medium [&_a]:text-brand-harbor [&_a]:underline">
            <Contact kind="email" />
          </p>
        </div>
        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
          <MessageCircle className="h-6 w-6 text-brand-harbor" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">WhatsApp</h2>
          <p className="mt-1 text-sm text-brand-ink/75 [&_a]:font-medium [&_a]:text-brand-harbor [&_a]:underline">
            <Contact kind="whatsapp" />
          </p>
        </div>
      </div>

      <Prose>
        <h2>What to send us</h2>
        <ul>
          <li>The email address on your account. We never need your password or PIN, so don&apos;t send them.</li>
          <li>
            The <strong>reference</strong> of the purchase (on its receipt) or top-up (from Paystack), the phone
            number and roughly when it happened.
          </li>
          <li>If the app showed an error with a reference code, that code. It lets us find exactly what happened.</li>
        </ul>

        <h2>How we handle complaints and disputes</h2>
        <ol>
          <li>Contact us by email or WhatsApp with the details above.</li>
          <li>We acknowledge it {BUSINESS.firstResponse}.</li>
          <li>
            We check our records and, where needed, with Paystack, VTpass or the network. Every naira in your wallet
            is recorded, so we can trace exactly what happened.
          </li>
          <li>
            We aim to resolve it {BUSINESS.disputeResolution}. If you&apos;re owed money, we credit your wallet or
            refund your payment, as our <Link href="/refunds">Refund Policy</Link> explains.
          </li>
          <li>
            If you&apos;re not happy with the outcome, reply and ask us to look at it again. You can also
            contact the Federal Competition and Consumer Protection Commission (FCCPC). For concerns about your
            personal data, contact us at <Contact kind="privacy" /> or the Nigeria Data Protection Commission.
          </li>
        </ol>

        <h2>Common questions</h2>
        {QUESTIONS.map(({ q, a }) => (
          <div key={q}>
            <h3>{q}</h3>
            <p>{a}</p>
          </div>
        ))}
      </Prose>
    </main>
  );
}
