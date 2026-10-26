import type { Metadata } from "next";
import Link from "next/link";

import { PolicyPage } from "@/components/site/SiteChrome";
import { BUSINESS } from "@/content/business";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundsPage() {
  return (
    <PolicyPage
      title="Refund Policy"
      intro="Most refunds happen automatically: money only leaves your wallet when the network confirms delivery. Here is what happens in each case."
    >
      <h2>A purchase failed</h2>
      <p>
        The money is returned to your wallet automatically as soon as the network or VTpass confirms the failure.
        You can see it in History as a refund, and use it again straight away.
      </p>

      <h2>A purchase is &quot;Processing&quot;</h2>
      <p>
        Sometimes a network takes longer to confirm. Until it does, the money is held, not spent. It is either
        delivered or returned to your wallet, and this is settled automatically, usually within minutes. The
        receipt page updates by itself. If a purchase is still processing after an hour, contact us with its
        reference.
      </p>

      <h2>The network reversed a purchase</h2>
      <p>
        Occasionally a network reverses airtime or data after delivering it. When that happens we return the money
        to your wallet automatically and remove the reward points the purchase earned.
      </p>

      <h2>Wrong number or network</h2>
      <p>
        Airtime and data delivered to the number you entered can&apos;t be recalled from the network, so we
        can&apos;t refund them. Please check the number before confirming. If a purchase failed because the network
        didn&apos;t match the number, it is refunded automatically, as above.
      </p>

      <h2>Problems with a top-up</h2>
      <ul>
        <li>
          <strong>You paid but your wallet wasn&apos;t credited:</strong> most of these are credited automatically
          within a few minutes. If not, contact us with the Paystack reference from your receipt or bank alert. We
          check with Paystack and credit your wallet if the payment went through.
        </li>
        <li>
          <strong>The amount charged didn&apos;t match:</strong> we hold the payment for review instead of crediting
          it, and contact you. We then either credit the correct amount or refund the payment to how you paid.
        </li>
        <li>
          <strong>You were charged twice:</strong> the duplicate is refunded to how you paid, through Paystack.
        </li>
      </ul>

      <h2>Money left in your wallet</h2>
      <p>
        Wallet money is for buying airtime and data on QuickSurf. If you want unused money back, for example to
        close your account, contact support: {BUSINESS.walletRefund}. We&apos;ll need to confirm it&apos;s your
        account first.
      </p>

      <h2>How to ask for a refund</h2>
      <p>
        Contact us through <Link href="/support">Help &amp; support</Link>, with the purchase or payment reference.
        We reply {BUSINESS.firstResponse} and aim to resolve refund requests {BUSINESS.disputeResolution}.
      </p>
    </PolicyPage>
  );
}
