<template>
  <div>
    <todo-item
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @update-todo="updateTodo"
      @delete-todo="deleteTodo"
    />
    <hr />
    <todo-creator @create-todo="createTodo" />
  </div>
</template>

<script>
import { LowSync, LocalStorage } from 'lowdb'
import cryptoRandomString from 'crypto-random-string'
import _cloneDeep from 'lodash/cloneDeep'
import TodoCreator from './TodoCreator'
import TodoItem from './TodoItem'

export default {
  components: {
    TodoCreator,
    TodoItem
  },
  data() {
    return {
      db: null,
      todos: []
    }
  },
  created() {
    this.initDB()
  },
  methods: {
    initDB() {
      const adapter = new LocalStorage('todo-app') // DB name
      this.db = new LowSync(adapter)

      this.db.read()

      if (this.db.data && this.db.data.todos) {
        this.todos = _cloneDeep(this.db.data.todos)
      } else {
        this.db.data = { todos: [] }
        this.db.write()
      }
    },
    createTodo(title) {
      const newTodo = {
        id: cryptoRandomString({ length: 10 }),
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
        done: false
      }

      this.db.data.todos.push(newTodo)
      this.db.write()
    },
    updateTodo() {
      console.log('Update todo!')
    },
    deleteTodo() {
      console.log('Delete todo!')
    }
  }
}
</script>
