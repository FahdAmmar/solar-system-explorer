import { useEffect } from 'react'
import { Link, useRouteError } from 'react-router'
import { PageTitle } from './PageTitle'

export function RouteError() {
  const error = useRouteError()

  // Details go to the console only; the UI never exposes internal errors.
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section role="alert" className="grid h-full place-items-center p-6 text-center">
      <PageTitle title="Something went wrong" />
      <div>
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-400">
          This page failed to load. Try again, or head back to the start.
        </p>
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
