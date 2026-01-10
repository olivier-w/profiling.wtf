interface MistakeCardProps {
  title: string
  correction: string
}

export function MistakeCard({ title, correction }: MistakeCardProps) {
  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
      <p className="text-sm text-[var(--text)]">
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-xs text-red-400">✗</span>
        "{title}"
      </p>
      <p className="mt-2 pl-7 text-sm text-[var(--text-muted)]">{correction}</p>
    </div>
  )
}
