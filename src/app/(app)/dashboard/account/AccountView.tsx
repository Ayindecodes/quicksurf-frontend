"use client";

import { BadgeCheck, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import toast from "react-hot-toast";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, PageHeader } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { onlyDigits, PinField, TextField } from "@/components/ui/Field";
import { NetworkPicker } from "@/components/ui/NetworkPicker";
import { PasswordField } from "@/components/ui/PasswordField";
import { useAuth } from "@/context/AuthContext";
import { useApi, useInterval } from "@/hooks/useApi";
import { ApiError, errorMessage } from "@/lib/api";
import { account, savedNumbers } from "@/lib/endpoints";
import { NETWORK_NAMES, naira, normalizePhone } from "@/lib/format";
import { saveTokens } from "@/lib/tokens";
import type { Network, Profile } from "@/lib/types";

/** Form state shared by the sections: busy flag and the last error (field errors stay on the ApiError). */
function useForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | string | null>(null);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof ApiError && Object.keys(err.fields).length ? err : errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  const field = (name: string) => (error instanceof ApiError ? error.field(name) : undefined);
  const banner = typeof error === "string" ? <Alert tone="error">{error}</Alert> : null;
  return { busy, run, field, banner, setError };
}

function Section({ id, title, description, children }: { id?: string; title: string; description?: string; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-24" aria-labelledby={`${id ?? title}-title`}>
      <h2 id={`${id ?? title}-title`} className="text-lg font-semibold">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-brand-ink/70">{description}</p>}
      <div className="mt-5">{children}</div>
    </Card>
  );
}

export function AccountView() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <>
      <PageHeader
        title="Account"
        actions={
          <Link href="/support" className="text-sm font-medium text-brand-harbor hover:underline">
            Help &amp; support
          </Link>
        }
      />
      <div className="space-y-6">
        <ProfileSection user={user} />
        <PhoneSection user={user} />
        <LimitsSection user={user} />
        <PinSection hasPin={user.has_pin} />
        <PasswordSection />
        <SavedNumbersSection />
        <SessionsSection />
        <CloseAccountSection />
      </div>
    </>
  );
}

function ProfileSection({ user }: { user: Profile }) {
  const { setUser } = useAuth();
  const form = useForm();
  const [values, setValues] = useState({ first_name: user.first_name, last_name: user.last_name });

  const save = (event: FormEvent) => {
    event.preventDefault();
    return form.run(async () => {
      setUser(await account.update(values));
      toast.success("Profile saved");
    });
  };

  return (
    <Section title="Profile">
      <form onSubmit={save} className="space-y-4" noValidate>
        {form.banner}
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Email</p>
          <p className="flex flex-wrap items-center gap-2 text-sm">
            {user.email}
            {user.email_verified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Confirmed
              </span>
            ) : (
              <Link href="/dashboard/verify-email" className="text-xs font-semibold text-amber-800 underline">
                Not confirmed. Confirm now
              </Link>
            )}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            maxLength={150}
            value={values.first_name}
            onChange={(e) => setValues({ ...values, first_name: e.target.value })}
            error={form.field("first_name")}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            maxLength={150}
            value={values.last_name}
            onChange={(e) => setValues({ ...values, last_name: e.target.value })}
            error={form.field("last_name")}
          />
        </div>
        <Button type="submit" loading={form.busy}>
          Save profile
        </Button>
      </form>
    </Section>
  );
}

function PhoneSection({ user }: { user: Profile }) {
  const { setUser } = useAuth();
  const form = useForm();
  const [changing, setChanging] = useState(!user.phone_verified);
  const [phone, setPhone] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(0);
  useInterval(() => setWait((s) => Math.max(0, s - 1)), 1000, wait > 0);

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    return form.run(async () => {
      const { phone: normalized, detail } = await account.sendPhoneCode(sentTo ?? phone);
      setSentTo(normalized);
      setWait(60);
      toast.success(detail);
    });
  };

  const confirm = (event: FormEvent) => {
    event.preventDefault();
    return form.run(async () => {
      setUser(await account.confirmPhone(code));
      setSentTo(null);
      setCode("");
      setPhone("");
      setChanging(false);
      toast.success("Phone number verified");
    });
  };

  return (
    <Section
      id="phone"
      title="Phone number"
      description="We text you a code to confirm it. It protects your account and raises your daily limits. A number can be verified on one account only."
    >
      {!changing && user.phone_verified ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm">
            <span className="font-medium">{user.phone}</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Verified
            </span>
          </p>
          <Button variant="secondary" onClick={() => setChanging(true)}>
            Use a different number
          </Button>
        </div>
      ) : sentTo === null ? (
        <form onSubmit={send} className="space-y-4" noValidate>
          {form.banner}
          <TextField
            label="Your phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="0803 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={form.field("phone")}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={form.busy} disabled={!normalizePhone(phone)}>
              Text me a code
            </Button>
            {user.phone_verified && (
              <Button variant="ghost" onClick={() => setChanging(false)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={confirm} className="space-y-4" noValidate>
          <p className="text-sm text-brand-ink/75">
            Enter the 6-digit code we texted to <strong>{sentTo}</strong>. It expires in 15 minutes.
          </p>
          {form.banner}
          <TextField
            label="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(onlyDigits(e.target.value, 6))}
            error={form.field("code")}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={form.busy} disabled={code.length !== 6}>
              Verify number
            </Button>
            <Button variant="ghost" onClick={() => send()} disabled={wait > 0 || form.busy}>
              {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setSentTo(null);
                setCode("");
              }}
            >
              Change number
            </Button>
          </div>
        </form>
      )}
    </Section>
  );
}

function LimitsSection({ user }: { user: Profile }) {
  const fresh = useApi("limits", account.me); // usage changes as the user buys, so load it again here
  const limits = fresh.data?.limits ?? user.limits;
  const basic = limits.level === "basic";
  const row = (label: string, used: string, limit: string) => (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="text-brand-ink/70">{label}</dt>
      <dd className="text-right font-medium">
        {Number(limit) > 0 ? `${naira(used)} of ${naira(limit)}` : `${naira(used)} (no limit)`}
      </dd>
    </div>
  );
  return (
    <Section title="Your daily limits" description="They reset at midnight, Lagos time.">
      <p className="text-sm">
        Account level:{" "}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${basic ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"}`}
        >
          {basic ? "Basic" : "Verified"}
        </span>
      </p>
      <dl className="mt-3 divide-y divide-black/5 border-y border-black/5">
        {row("Purchases today", limits.spent_today, limits.daily_purchase_limit)}
        {row("Top-ups today", limits.topped_up_today, limits.daily_topup_limit)}
      </dl>
      {basic && (
        <p className="mt-3 text-sm text-brand-ink/70">
          <a href="#phone" className="font-medium text-brand-harbor underline">
            Verify your phone number
          </a>{" "}
          to raise these limits.
        </p>
      )}
    </Section>
  );
}

function PinSection({ hasPin }: { hasPin: boolean }) {
  const { reload } = useAuth();
  const form = useForm();
  const [pin, setPin] = useState("");
  const [again, setAgain] = useState("");
  const [password, setPassword] = useState("");
  const mismatch = again.length === 4 && pin !== again;

  const save = (event: FormEvent) => {
    event.preventDefault();
    return form.run(async () => {
      await account.setPin(pin, password);
      await reload();
      setPin("");
      setAgain("");
      setPassword("");
      toast.success(hasPin ? "PIN changed" : "PIN set. You can now buy airtime and data.");
    });
  };

  return (
    <Section
      id="pin"
      title={hasPin ? "Change transaction PIN" : "Set your transaction PIN"}
      description="You'll enter this 4-digit PIN to confirm every purchase. Avoid 1234, 0000 and similar."
    >
      <form onSubmit={save} className="space-y-4" noValidate>
        {form.banner}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PinField
            label={hasPin ? "New PIN" : "PIN"}
            value={pin}
            onChange={(e) => setPin(onlyDigits(e.target.value, 4))}
            error={form.field("pin")}
          />
          <PinField
            label="Repeat PIN"
            value={again}
            onChange={(e) => setAgain(onlyDigits(e.target.value, 4))}
            error={mismatch ? "The PINs don't match." : undefined}
          />
        </div>
        <PasswordField
          label="Account password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={form.field("password")}
          hint="To make sure it's really you."
        />
        <Button type="submit" loading={form.busy} disabled={pin.length !== 4 || pin !== again || !password}>
          {hasPin ? "Change PIN" : "Set PIN"}
        </Button>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const form = useForm();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");

  const save = (event: FormEvent) => {
    event.preventDefault();
    return form.run(async () => {
      const { access, refresh } = await account.changePassword(current, next);
      saveTokens({ access, refresh });
      setCurrent("");
      setNext("");
      toast.success("Password changed. Other devices have been signed out.");
    });
  };

  return (
    <Section title="Password" description="Changing it signs you out on every other device.">
      <form onSubmit={save} className="space-y-4" noValidate>
        {form.banner}
        <PasswordField
          label="Current password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={form.field("current_password")}
        />
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          error={form.field("new_password")}
        />
        <Button type="submit" loading={form.busy} disabled={!current || !next}>
          Change password
        </Button>
      </form>
    </Section>
  );
}

function SavedNumbersSection() {
  const list = useApi("saved-numbers", savedNumbers.list);
  const form = useForm();
  const [entry, setEntry] = useState<{ name: string; phone: string; network: Network | "" }>({ name: "", phone: "", network: "" });
  const [removing, setRemoving] = useState<number | null>(null);

  const add = (event: FormEvent) => {
    event.preventDefault();
    if (!entry.network) return;
    const network = entry.network;
    return form.run(async () => {
      await savedNumbers.add({ name: entry.name.trim(), phone: entry.phone, network });
      setEntry({ name: "", phone: "", network: "" });
      list.reload();
    });
  };

  async function remove(id: number) {
    setRemoving(id);
    try {
      await savedNumbers.remove(id);
      list.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setRemoving(null);
    }
  }

  return (
    <Section title="Saved numbers" description="Numbers you buy for often. Pick them from the airtime and data pages.">
      {list.data && list.data.length > 0 && (
        <ul className="mb-6 divide-y divide-black/5 rounded-xl border border-black/5">
          {list.data.map((saved) => (
            <li key={saved.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span>
                <span className="block font-medium">{saved.name}</span>
                <span className="text-brand-ink/60">
                  {saved.phone} · {NETWORK_NAMES[saved.network]}
                </span>
              </span>
              <Button variant="ghost" onClick={() => remove(saved.id)} loading={removing === saved.id} className="min-h-10 px-3 text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Remove {saved.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={add} className="space-y-4" noValidate>
        {form.banner}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Name"
            placeholder="e.g. Mum"
            maxLength={60}
            value={entry.name}
            onChange={(e) => setEntry({ ...entry, name: e.target.value })}
            error={form.field("name")}
          />
          <TextField
            label="Phone number"
            type="tel"
            placeholder="0803 123 4567"
            value={entry.phone}
            onChange={(e) => setEntry({ ...entry, phone: e.target.value })}
            error={form.field("phone")}
          />
        </div>
        <NetworkPicker value={entry.network} onChange={(network) => setEntry({ ...entry, network })} error={form.field("network")} />
        <Button type="submit" variant="secondary" loading={form.busy} disabled={!entry.name.trim() || !normalizePhone(entry.phone) || !entry.network}>
          Save number
        </Button>
      </form>
    </Section>
  );
}

function SessionsSection() {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  return (
    <Section title="Signed-in devices" description="Lost a phone? Sign out everywhere and log in again here.">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
        </Button>
        <Button
          variant="secondary"
          loading={busy}
          onClick={async () => {
            setBusy(true);
            await signOut({ everywhere: true });
          }}
        >
          Sign out on all devices
        </Button>
      </div>
    </Section>
  );
}

function CloseAccountSection() {
  const [open, setOpen] = useState(false);
  return (
    <Section
      title="Close account"
      description="Your personal details are removed and you can't sign in again. Purchase and payment records are kept, anonymised, as the law requires."
    >
      <Button variant="danger" onClick={() => setOpen(true)}>
        Close my account
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Close your account?">
        <CloseAccountForm />
      </Dialog>
    </Section>
  );
}

function CloseAccountForm() {
  const router = useRouter();
  const { forget } = useAuth();
  const form = useForm();
  const [password, setPassword] = useState("");

  const close = (event: FormEvent) => {
    event.preventDefault();
    return form.run(async () => {
      await account.close(password);
      forget();
      toast.success("Your account has been closed.");
      router.replace("/");
    });
  };

  return (
    <form onSubmit={close} className="space-y-4">
      <p className="text-sm text-brand-ink/75">
        This can&apos;t be undone. Your wallet must be empty and no purchase may be processing.
      </p>
      {form.banner}
      <PasswordField
        label="Password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={form.field("password")}
      />
      <Button type="submit" variant="danger" loading={form.busy} disabled={!password} className="w-full">
        Close account
      </Button>
    </form>
  );
}
