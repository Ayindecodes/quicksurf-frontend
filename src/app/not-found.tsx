import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-semibold text-brand-harbor">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-brand-ink/70">The page you were looking for doesn&apos;t exist.</p>
      <ButtonLink href="/">Back to QuickSurf</ButtonLink>
    </main>
  );
}
