<template>
  <div>
    <todo-item />
    <todo-creator />
  </div>
</template>

<script>
import { LowSync, LocalStorage } from 'lowdb'
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
    }
  }
}
</script>
