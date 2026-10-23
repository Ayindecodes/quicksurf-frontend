import type { Metadata } from "next";
import Link from "next/link";

import { Contact, PolicyPage } from "@/components/site/SiteChrome";
import { BUSINESS } from "@/content/business";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms of Service"
      intro={
        <>
          These terms are the agreement between you and {BUSINESS.legalName} (&quot;QuickSurf&quot;, &quot;we&quot;)
          for using QuickSurf. By creating an account you accept them. Please read them together with our{" "}
          <Link href="/privacy">Privacy Policy</Link> and <Link href="/refunds">Refund Policy</Link>.
        </>
      }
    >
      <h2>1. Who can use QuickSurf</h2>
      <ul>
        <li>You must be at least 18 years old and able to enter into a contract.</li>
        <li>One account per person. The details you give us must be true and kept up to date.</li>
        <li>QuickSurf sells airtime and data for Nigerian mobile numbers (MTN, Glo, Airtel and 9mobile).</li>
      </ul>

      <h2>2. Your account and security</h2>
      <ul>
        <li>
          Keep your password and 4-digit transaction PIN secret. Every purchase needs your PIN, and we treat
          purchases made with it as made by you.
        </li>
        <li>
          If you think someone else has access to your account, change your password and use &quot;Sign out on all
          devices&quot; in Account straight away, then contact us.
        </li>
        <li>You must confirm your email address before you can fund your wallet.</li>
        <li>After several wrong PINs, purchases are paused for 30 minutes to protect you.</li>
      </ul>

      <h2>3. Your wallet</h2>
      <ul>
        <li>
          Your wallet holds naira you have paid in, to spend on QuickSurf. It is not a bank account or a savings
          product: it earns no interest and can&apos;t be sent to other users.
        </li>
        <li>
          You fund it through Paystack, our payment provider. We don&apos;t see or store your card details. We
          don&apos;t charge a fee for funding your wallet.
        </li>
        <li>
          A payment is added to your wallet once Paystack confirms it, and only for the amount you were asked to
          pay. If Paystack reports a different amount, we hold the payment for review and contact you.
        </li>
        <li>
          There are minimum and maximum amounts and daily limits for top-ups and purchases. We show them when they
          apply and may change them, for example to prevent fraud.
        </li>
        <li>How unused wallet money is paid back is explained in the <Link href="/refunds">Refund Policy</Link>.</li>
      </ul>

      <h2>4. Buying airtime and data</h2>
      <ul>
        <li>
          You choose the phone number, network and amount or data plan. <strong>Please check them before you
          confirm.</strong> Airtime or data delivered to the number you entered can&apos;t be taken back.
        </li>
        <li>
          We suggest a network from the number&apos;s prefix, but numbers can be moved between networks. You
          confirm the network.
        </li>
        <li>Data plan prices are shown before you confirm, and that is the price you pay.</li>
        <li>
          When you confirm, the amount is set aside from your balance. If the network delivers, it is spent. If the
          purchase fails, it is returned to your wallet automatically. Delivery is usually instant, but sometimes
          the network takes longer. The money stays set aside, not spent, until we know the result.
        </li>
        <li>
          If a network reverses a delivered purchase, we return the money to your wallet and remove any points it
          earned.
        </li>
      </ul>

      <h2>5. Rewards</h2>
      <ul>
        <li>
          You earn points on successful purchases at the rate we set, and can turn them into wallet money once you
          have the minimum shown on the Rewards page.
        </li>
        <li>Points have no other cash value and can&apos;t be transferred. Points left when you close your account lapse.</li>
        <li>We may change or end the rewards programme. If we do, we&apos;ll tell you in advance.</li>
      </ul>

      <h2>6. Things you must not do</h2>
      <ul>
        <li>Use QuickSurf for fraud, money laundering or anything illegal, or with money or cards that aren&apos;t yours to use.</li>
        <li>Try to get a refund for something that was delivered, including through a false chargeback.</li>
        <li>Interfere with the service, test its security without our written permission, or use automated tools to make purchases.</li>
      </ul>
      <p>
        We may refuse or hold a transaction, limit or suspend an account, and report to the authorities, where we
        reasonably suspect any of these or where the law requires it. Unless the law stops us, we&apos;ll tell you why.
      </p>

      <h2>7. When things go wrong</h2>
      <ul>
        <li>
          QuickSurf depends on Paystack, VTpass and the mobile networks. We work to keep the service available but
          can&apos;t promise it will never be interrupted.
        </li>
        <li>
          If a purchase fails, our responsibility is to return the money to your wallet, as described in the{" "}
          <Link href="/refunds">Refund Policy</Link>. To the extent the law allows, we aren&apos;t liable for
          indirect losses, such as missed calls or lost business, caused by a delayed or failed top-up.
        </li>
        <li>Nothing in these terms limits rights you have under Nigerian consumer protection law.</li>
      </ul>

      <h2>8. Closing your account</h2>
      <p>
        You can close your account in Account settings once your wallet is empty and no purchase is processing.
        Your personal details are then removed, but we keep records of your transactions for as long as the law
        requires ({BUSINESS.recordsKeptFor}). We may close an account that breaks these terms, with notice where
        we can give it.
      </p>

      <h2>9. Complaints, changes and the law</h2>
      <ul>
        <li>
          If you have a problem, please contact us first: see <Link href="/support">Help &amp; support</Link>. We
          aim to resolve complaints {BUSINESS.disputeResolution}.
        </li>
        <li>
          We may update these terms. If a change matters to you, we&apos;ll tell you before it takes effect. Using
          QuickSurf after that means you accept the new terms.
        </li>
        <li>These terms are governed by the laws of the Federal Republic of Nigeria.</li>
      </ul>

      <h2>10. Contact</h2>
      <p>
        {BUSINESS.legalName}, {BUSINESS.address}. {BUSINESS.registration}. Email: <Contact kind="email" />.
        WhatsApp: <Contact kind="whatsapp" />.
      </p>
    </PolicyPage>
  );
}
