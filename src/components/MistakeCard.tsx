interface MistakeCardProps {
  title: string
  correction: string
}

export function MistakeCard({ title, correction }: MistakeCardProps) {
  return (
    <div className="py-5">
      <p className="text-[var(--text-muted)] line-through decoration-[var(--text-muted)]/50">
        "{title}"
      </p>
      <p className="mt-2 text-[var(--text)]">
        {correction}
      </p>
    </div>
  )
}
