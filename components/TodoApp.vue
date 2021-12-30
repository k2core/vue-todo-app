<template>
  <div>
    <todo-item />
    <todo-creator @create-todo="createTodo" />
  </div>
</template>

<script>
import { LowSync, LocalStorage } from 'lowdb'
import cryptoRandomString from 'crypto-random-string'
import TodoCreator from './TodoCreator'
import TodoItem from './TodoItem'

export default {
  components: {
    TodoCreator,
    TodoItem
  },
  data() {
    return {
      db: null
    }
  },
  created() {
    this.initDB()
  },
  methods: {
    initDB() {
      const adapter = new LocalStorage('todo-app') // DB name
      this.db = new LowSync(adapter)

      // Local DB 초기화
      this.db.read()
      this.db.data ||= { todos: [] }
      this.db.write()
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
    }
  }
}
</script>
