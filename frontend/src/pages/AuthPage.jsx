import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { ArrowLeft, Logo } from '../components/icons'
import ThemeToggle from '../components/ThemeToggle'

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const { user, login, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) await login(form.username, form.password)
      else await register(form.username, form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-5 py-5">
      <div className="flex items-center justify-between">
        <Link to="/welcome" className="btn-ghost w-fit"><ArrowLeft /> Back</Link>
        <ThemeToggle />
      </div>

      <div className="mx-auto my-auto w-full max-w-sm py-10">
        <Logo className="h-9 w-9" />
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">{isLogin ? 'Log in' : 'Create your account'}</h1>
        <p className="mt-1.5 text-fog-300">
          {isLogin ? 'New here? ' : 'Already have one? '}
          <Link to={isLogin ? '/register' : '/login'} className="text-link underline underline-offset-2">
            {isLogin ? 'Sign up instead' : 'Log in'}
          </Link>
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="username">{isLogin ? 'Username or email' : 'Username'}</label>
            <input id="username" className="input" name="username" value={form.username} onChange={update} required autoFocus autoComplete="username" />
          </div>
          {!isLogin && (
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" className="input" type="email" name="email" value={form.email} onChange={update} required autoComplete="email" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" className="input" type="password" name="password" value={form.password} onChange={update} required
              minLength={isLogin ? 1 : 6} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            {!isLogin && <p className="mt-1.5 text-sm text-fog-500">At least 6 characters.</p>}
          </div>
          {error && <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p>}
          <button className="btn-primary w-full py-2.5" disabled={busy}>
            {busy ? 'One moment…' : isLogin ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
