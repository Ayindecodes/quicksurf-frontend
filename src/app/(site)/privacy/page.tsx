import type { Metadata } from "next";
import Link from "next/link";

import { Contact, PolicyPage } from "@/components/site/SiteChrome";
import { BUSINESS } from "@/content/business";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro={
        <>
          This explains what personal data QuickSurf collects, why, who we share it with, and your rights under the
          Nigeria Data Protection Act 2023. {BUSINESS.legalName} is the data controller.
        </>
      }
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your account:</strong> email address, password (stored only as a secure hash), and, if you add
          them, your name and phone number.
        </li>
        <li>
          <strong>Your transactions:</strong> top-ups (amount, Paystack reference, result), purchases (the phone
          number, network, plan, amount and result), your wallet history and reward points. Card details go straight
          to Paystack. We never see or store them.
        </li>
        <li>
          <strong>Saved numbers:</strong> numbers and names you choose to save for quick purchases.
        </li>
        <li>
          <strong>Security information:</strong> your transaction PIN (stored only as a secure hash), and when you
          sign in, your IP address, browser or device details, the time, and a random ID the app keeps on your
          device.
        </li>
        <li>
          <strong>Verification and fraud prevention:</strong> your phone number, confirmed with a code we text
          you; and for each top-up, a code from Paystack that identifies the card or bank account that paid (not
          the card or account number). We use these to make sure each person has one account and to spot
          stolen cards.
        </li>
        <li>
          <strong>Messages:</strong> emails we send you (codes and receipts) and anything you send our support team.
        </li>
        <li>
          <strong>Website usage:</strong> page views and loading speed, counted without cookies and without
          identifying you. We may also record technical error reports, with personal details removed.
        </li>
      </ul>

      <h2>Why we use it</h2>
      <ul>
        <li>
          <strong>To provide QuickSurf (our contract with you):</strong> running your account and wallet, delivering
          purchases, sending codes and receipts, and answering support requests.
        </li>
        <li>
          <strong>To keep you and QuickSurf safe (legitimate interests and legal duties):</strong> preventing fraud
          and misuse, making sure each person has one account, securing accounts, and investigating problems.
        </li>
        <li>
          <strong>To meet the law (legal obligation):</strong> keeping financial records and answering lawful requests
          from authorities.
        </li>
        <li>We don&apos;t send marketing messages unless you have agreed to receive them, and you can stop them at any time.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>We don&apos;t sell your personal data. We share only what each of these needs to do their job for us:</p>
      <ul>
        <li><strong>Paystack</strong>: processes your payments.</li>
        <li><strong>VTpass</strong>: delivers airtime and data. It receives the phone number, network and amount.</li>
        <li><strong>Our SMS provider</strong> (Termii): sends your verification codes. It receives your phone number.</li>
        <li><strong>Hosting and email providers</strong> (such as Render and Vercel): run our servers, database and website, and send our emails.</li>
        <li><strong>Error monitoring</strong> (such as Sentry): if used, receives technical error details without your personal details.</li>
        <li><strong>Authorities</strong>: when the law requires it.</li>
      </ul>
      <p>
        Some of these providers store data outside Nigeria. When that happens we rely on the protections the Nigeria
        Data Protection Act 2023 requires for transfers abroad, such as contractual safeguards.
      </p>

      <h2>How long we keep it</h2>
      <ul>
        <li>Your account details: while your account is open.</li>
        <li>
          When you close your account we remove your name, email, phone number, PIN and saved numbers. Records of
          your transactions are kept, without those details, for as long as the law requires
          ({BUSINESS.recordsKeptFor}).
        </li>
        <li>
          Sign-in records, emails we sent, one-time codes and messages exchanged with our payment and airtime
          providers are deleted after 180 days.
        </li>
      </ul>

      <h2>How we protect it</h2>
      <ul>
        <li>Everything is sent over encrypted connections (HTTPS).</li>
        <li>Passwords, PINs and codes are stored only as secure hashes.</li>
        <li>Staff access is limited to what each role needs, and needs two-step sign-in.</li>
        <li>Our logs hide phone numbers and email addresses.</li>
      </ul>
      <p>
        If a breach puts your data at risk, we will tell the Nigeria Data Protection Commission and you, as the law
        requires.
      </p>

      <h2>Your rights</h2>
      <p>Under the Nigeria Data Protection Act 2023 you can ask us to:</p>
      <ul>
        <li>tell you what data we hold about you and give you a copy;</li>
        <li>correct data that is wrong. You can edit your profile yourself in Account;</li>
        <li>delete your data. Closing your account does this, except the records the law makes us keep;</li>
        <li>restrict or object to how we use it, or move it to another service;</li>
        <li>withdraw consent you have given;</li>
        <li>not be subject to decisions made only by automated means that significantly affect you.</li>
      </ul>
      <p>
        Email <Contact kind="privacy" /> to use any of these rights. We may need to confirm it&apos;s you, and
        we&apos;ll reply as soon as we can, within the time the law allows. If you&apos;re not satisfied, you can complain to the Nigeria Data Protection
        Commission.
      </p>

      <h2>Cookies and storage</h2>
      <p>
        QuickSurf doesn&apos;t use advertising or tracking cookies. To keep you signed in, the app stores sign-in
        tokens in your browser&apos;s storage. If you didn&apos;t tick &quot;Keep me signed in&quot;, they are removed
        when you close the tab. Signing out removes them.
      </p>

      <h2>Children</h2>
      <p>QuickSurf is not for anyone under 18, and we don&apos;t knowingly collect their data.</p>

      <h2>Changes and contact</h2>
      <p>
        We&apos;ll update this page when our practices change, and tell you about important changes. Questions:{" "}
        <Contact kind="privacy" />, or write to {BUSINESS.legalName}, {BUSINESS.address}. See also our{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>
    </PolicyPage>
  );
}
