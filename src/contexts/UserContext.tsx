import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../services/userStorage'
import { UserStorageService } from '../services/userStorage'

interface UserContextType {
  currentUser: User | null
  isLoggedIn: boolean
  login: (username: string) => User | null
  logout: () => void
  createUser: (username: string, email: string) => User
  updateUser: (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => User | null
  deleteUser: (id: string) => boolean
  getAllUsers: () => User[]
}

const UserContext = createContext<UserContextType | null>(null)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const user = UserStorageService.getCurrentUser()
    setCurrentUser(user)
  }, [])

  const login = (username: string): User | null => {
    const user = UserStorageService.login(username)
    setCurrentUser(user)
    return user
  }

  const logout = () => {
    UserStorageService.logout()
    setCurrentUser(null)
  }

  const createUser = (username: string, email: string): User => {
    const user = UserStorageService.createUser(username, email)
    return user
  }

  const updateUser = (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null => {
    const updatedUser = UserStorageService.updateUser(id, updates)
    if (updatedUser && currentUser?.id === id) {
      setCurrentUser(updatedUser)
    }
    return updatedUser
  }

  const deleteUser = (id: string): boolean => {
    const result = UserStorageService.deleteUser(id)
    if (result && currentUser?.id === id) {
      setCurrentUser(null)
    }
    return result
  }

  const getAllUsers = (): User[] => {
    return UserStorageService.getUsers()
  }

  const value: UserContextType = {
    currentUser,
    isLoggedIn: !!currentUser,
    login,
    logout,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}