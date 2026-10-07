import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Layout from './components/Layout'
import AuthPage from './pages/AuthPage'
import Chat from './pages/Chat'
import Explore from './pages/Explore'
import Landing from './pages/Landing'
import MyBots from './pages/MyBots'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid h-screen place-items-center text-fog-500">Loading…</div>
  return user ? children : <Navigate to="/welcome" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<Landing />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Explore />} />
        <Route path="/my-bots" element={<MyBots />} />
        <Route path="/chat/:id" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
