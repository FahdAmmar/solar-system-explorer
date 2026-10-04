interface PagePlaceholderProps {
  title: string
  note: string
}

// Temporary: each page is replaced by its real implementation in a later phase.
export function PagePlaceholder({ title, note }: PagePlaceholderProps) {
  return (
    <section className="grid h-full place-items-center p-6 text-center">
      <div>
        <p className="text-xs tracking-[0.3em] text-sky-300 uppercase">{note}</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{title}</h1>
      </div>
    </section>
  )
}
