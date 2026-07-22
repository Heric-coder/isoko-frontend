import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="py-20 text-center">
      <p className="text-4xl font-bold text-indigo-700">404</p>
      <p className="mt-2 text-indigo-500">Page not found.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back home</Link>
    </div>
  )
}
