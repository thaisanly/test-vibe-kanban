import { useState, useEffect } from 'react'
import './App.css'
import { ThemeToggle } from './components/ThemeToggle'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      }))
      setTodos(parsedTodos)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date()
      }
      setTodos([newTodo, ...todos])
      setInputValue('')
    }
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const startEditing = (id: string, text: string) => {
    setEditingId(id)
    setEditingText(text)
  }

  const saveEdit = () => {
    if (editingId && editingText.trim()) {
      setTodos(todos.map(todo => 
        todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
      ))
      setEditingId(null)
      setEditingText('')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  return (
    <div className="todo-app">
      <ThemeToggle />
      <h1>Todo List</h1>
      
      <div className="todo-input-container">
        <input
          type="text"
          className="todo-input"
          placeholder="Add a new todo..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button className="add-button" onClick={addTodo}>
          Add
        </button>
      </div>

      <div className="todos-container">
        {todos.length === 0 ? (
          <p className="no-todos">No todos yet. Add one above!</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editingId === todo.id ? (
                  <div className="edit-container">
                    <input
                      type="text"
                      className="edit-input"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                    />
                    <button className="save-button" onClick={saveEdit}>Save</button>
                    <button className="cancel-button" onClick={cancelEdit}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="todo-content">
                      <input
                        type="checkbox"
                        className="todo-checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                      />
                      <span className="todo-text">{todo.text}</span>
                    </div>
                    <div className="todo-actions">
                      <button className="edit-button" onClick={() => startEditing(todo.id, todo.text)}>
                        Edit
                      </button>
                      <button className="delete-button" onClick={() => deleteTodo(todo.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App