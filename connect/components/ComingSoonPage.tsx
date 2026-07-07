export default function ComingSoonPage({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <span className="label-mono">{note}</span>
      <h1 className="mt-2 font-display text-2xl font-medium">{title}</h1>
    </div>
  )
}
