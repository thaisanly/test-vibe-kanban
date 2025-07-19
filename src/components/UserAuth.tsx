import { useState } from 'react'
import { useUser } from '../hooks/useUser'
import './UserAuth.css'

export const UserAuth = () => {
  const { currentUser, isLoggedIn, login, logout, createUser } = useUser()
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isSignUp) {
        if (!username || !email) {
          setError('Please fill in all fields')
          return
        }
        createUser(username, email)
        login(username)
      } else {
        if (!username) {
          setError('Please enter a username')
          return
        }
        const user = login(username)
        if (!user) {
          setError('User not found')
        }
      }
      setUsername('')
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const handleLogout = () => {
    logout()
    setUsername('')
    setEmail('')
    setError('')
  }

  if (isLoggedIn && currentUser) {
    return (
      <div className="user-auth">
        <div className="user-info">
          <span className="username">Welcome, {currentUser.username}!</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="user-auth">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="auth-input"
        />
        
        {isSignUp && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
        )}
        
        <button type="submit" className="auth-button">
          {isSignUp ? 'Sign Up' : 'Login'}
        </button>
        
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError('')
          }}
          className="switch-button"
        >
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </button>
      </form>
    </div>
  )
}