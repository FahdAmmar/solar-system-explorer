import { Link } from 'react-router'
import { PageTitle } from '@/components/common/PageTitle'

export default function NotFoundPage() {
  return (
    <section className="grid h-full place-items-center p-6 text-center">
      <PageTitle title="Page not found" />
      <div>
        <p className="text-xs tracking-[0.3em] text-sky-300 uppercase">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Lost in space</h1>
        <p className="mt-3 text-sm text-slate-400">That page does not exist.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded border border-white/20 px-4 py-2 text-sm hover:border-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          Back to home
        </Link>
      </div>
    </section>
  )
}
