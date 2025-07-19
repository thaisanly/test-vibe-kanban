export interface User {
  id: string
  username: string
  email: string
  createdAt: Date
  lastLoginAt?: Date
}

const USERS_KEY = 'users'
const CURRENT_USER_KEY = 'currentUser'

export class UserStorageService {
  static getUsers(): User[] {
    const usersJson = localStorage.getItem(USERS_KEY)
    if (!usersJson) return []
    
    try {
      const users = JSON.parse(usersJson)
      return users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
      }))
    } catch (error) {
      console.error('Error parsing users from localStorage:', error)
      return []
    }
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  static createUser(username: string, email: string): User {
    const users = this.getUsers()
    
    const existingUser = users.find(u => u.username === username || u.email === email)
    if (existingUser) {
      throw new Error('User with this username or email already exists')
    }

    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      createdAt: new Date()
    }

    users.push(newUser)
    this.saveUsers(users)
    
    return newUser
  }

  static updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === id)
    
    if (userIndex === -1) return null

    if (updates.username || updates.email) {
      const duplicate = users.find((u, idx) => 
        idx !== userIndex && 
        (updates.username && u.username === updates.username || 
         updates.email && u.email === updates.email)
      )
      if (duplicate) {
        throw new Error('User with this username or email already exists')
      }
    }

    users[userIndex] = { ...users[userIndex], ...updates }
    this.saveUsers(users)
    
    return users[userIndex]
  }

  static deleteUser(id: string): boolean {
    const users = this.getUsers()
    const filteredUsers = users.filter(u => u.id !== id)
    
    if (filteredUsers.length === users.length) return false
    
    this.saveUsers(filteredUsers)
    
    if (this.getCurrentUser()?.id === id) {
      this.logout()
    }
    
    return true
  }

  static getUserById(id: string): User | null {
    const users = this.getUsers()
    return users.find(u => u.id === id) || null
  }

  static getUserByUsername(username: string): User | null {
    const users = this.getUsers()
    return users.find(u => u.username === username) || null
  }

  static getUserByEmail(email: string): User | null {
    const users = this.getUsers()
    return users.find(u => u.email === email) || null
  }

  static login(username: string): User | null {
    const user = this.getUserByUsername(username)
    if (!user) return null

    user.lastLoginAt = new Date()
    this.updateUser(user.id, { lastLoginAt: user.lastLoginAt })
    
    localStorage.setItem(CURRENT_USER_KEY, user.id)
    return user
  }

  static logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  static getCurrentUser(): User | null {
    const userId = localStorage.getItem(CURRENT_USER_KEY)
    if (!userId) return null
    
    return this.getUserById(userId)
  }

  static isLoggedIn(): boolean {
    return this.getCurrentUser() !== null
  }

  static clearAllUsers(): void {
    localStorage.removeItem(USERS_KEY)
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}