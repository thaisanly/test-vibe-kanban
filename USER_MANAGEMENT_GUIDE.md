# User Management Guide

This todo application now includes a user management system using localStorage.

## Features

1. **User Registration**: New users can sign up with a unique username and email
2. **User Login**: Existing users can log in with their username
3. **User-specific Todos**: Each user has their own separate todo list
4. **Persistent Storage**: All data is stored in localStorage

## How to Use

1. **Sign Up**: 
   - Click "Don't have an account? Sign Up"
   - Enter a username and email
   - Click "Sign Up" to create your account

2. **Login**:
   - Enter your username
   - Click "Login"

3. **Manage Todos**:
   - Once logged in, you can add, edit, delete, and toggle todos
   - Your todos are saved separately from other users

4. **Logout**:
   - Click the "Logout" button to sign out
   - Your todos will be preserved for next time

## API Reference

### UserStorageService

```typescript
// Create a new user
UserStorageService.createUser(username: string, email: string): User

// Login a user
UserStorageService.login(username: string): User | null

// Get current logged-in user
UserStorageService.getCurrentUser(): User | null

// Update user information
UserStorageService.updateUser(id: string, updates: Partial<User>): User | null

// Delete a user
UserStorageService.deleteUser(id: string): boolean

// Get all users
UserStorageService.getUsers(): User[]
```

### Using the UserContext

```typescript
import { useUser } from './hooks/useUser'

const Component = () => {
  const { currentUser, isLoggedIn, login, logout, createUser } = useUser()
  
  // Use the user management functions
}
```

## Storage Structure

- Users are stored in localStorage under the key `users`
- Current user session is stored under `currentUser`
- Todos are stored per user under `todos_{userId}`