<template>
  <div class="todo-app">
    <div class="todo-app__actions">
      <div class="filters">
        <button
          :class="{ active: filter === 'all' }"
          @click="changeFilter('all')"
        >
          모든 항목 ({{ total }})
        </button>
        <button
          :class="{ active: filter === 'active' }"
          @click="changeFilter('active')"
        >
          해야 할 항목 ({{ activeCount }})
        </button>
        <button
          :class="{ active: filter === 'completed' }"
          @click="changeFilter('completed')"
        >
          완료된 항목 ({{ completedCount }})
        </button>
      </div>
      <div class="actions clearfix">
        <div class="float--left">
          <label>
            <input v-model="allDone" type="checkbox" />
            <span class="icon"><i class="material-icons">done_all</i></span>
          </label>
        </div>
        <div class="float--right clearfix">
          <button class="btn float--left" @click="scrollToTop">
            <i class="material-icons">expand_less</i>
          </button>
          <button class="btn float--left" @click="scrollToBottom">
            <i class="material-icons">expand_more</i>
          </button>
          <button class="btn btn--danger float--left" @click="clearCompleted">
            <i class="material-icons">delete_sweep</i>
          </button>
        </div>
      </div>
    </div>
    <div class="todo-app__list">
      <todo-item
        v-for="todo in filteredTodos"
        :key="todo.id"
        :todo="todo"
        @update-todo="updateTodo"
        @delete-todo="deleteTodo"
      />
    </div>
    <todo-creator class="todo-app__creator" @create-todo="createTodo" />
  </div>
</template>

<script>
import { LowSync, LocalStorage } from 'lowdb'
import cryptoRandomString from 'crypto-random-string'
import _cloneDeep from 'lodash/cloneDeep'
// import _chain from 'lodash/chain'
import _find from 'lodash/find'
import _assign from 'lodash/assign'
import _findIndex from 'lodash/findIndex'
import _forEachRight from 'lodash/forEachRight'
import scrollTo from 'scroll-to'
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
      todos: [],
      filter: 'all'
    }
  },
  computed: {
    filteredTodos() {
      switch (this.filter) {
        case 'all':
          return this.todos
        case 'active':
          return this.todos.filter(todo => !todo.done)
        case 'completed':
          return this.todos.filter(todo => todo.done)
        default:
          return this.todos
      }
    },
    total() {
      return this.todos.length
    },
    activeCount() {
      return this.todos.filter(todo => !todo.done).length
    },
    completedCount() {
      return this.total - this.activeCount
    },
    allDone: {
      get() {
        return this.total === this.completedCount && this.total > 0
      },
      set(checked) {
        this.completeAll(checked)
      }
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

      this.todos.push(newTodo)
    },
    updateTodo(todo, value) {
      /**
       * 강의 버전(lowdb 1.0.0)
       */
      // this.db
      //   .get('todos')
      //   .find({ id: todo.id })
      //   .assign(value)
      //   .write()

      /**
       * lowdb README.md의 Lodash chain 사용법
       * 아래 코드는 오류가 발생한다. 이유는 아직 모르겠다.
       * 추후 시간을 내서 Lodash의 체이닝을 이용하는 이 방법을 알아봐야겠다.
       * "TypeError: this.db.chain.get is not a function"
       */
      // this.db.chain = _chain(this.db.data)
      // const post = this.db.chain
      //   .get('todos')
      //   .find(p => p.id === todo.id)
      //   .value()

      for (let i = 0; i < this.db.data.todos.length; i++) {
        if (this.db.data.todos[i].id === todo.id) {
          this.db.data.todos[i] = { ...this.db.data.todos[i], ...value }
          this.db.write()
          break
        }
      }

      const foundTodo = _find(this.todos, { id: todo.id })
      _assign(foundTodo, value)
    },
    deleteTodo(todo) {
      /**
       * 강의 버전(lowdb 1.0.0)
       */
      // this.db
      //   .get('todos')
      //   .remove({ id: todo.id })
      //   .write()

      /**
       * 단순 for문
       */
      // for (let i = 0; i < this.db.data.todos.length; i++) {
      //   if (this.db.data.todos[i].id === todo.id) {
      //     this.db.data.todos.splice(i, 1)
      //     this.db.write()
      //     break
      //   }
      // }
      /**
       * 아래 this.todos에서 사용한 Lodash.findIndex 사용하기.
       * db와 화면이 동기화 되어 있어서 index를 한 번만 찾으면 되겠지만,
       * 혹시 몰라서 각각 찾아서 처리하는 것으로 했다.
       */
      const foundIndex1 = _findIndex(this.db.data.todos, { id: todo.id })
      this.db.data.todos.splice(foundIndex1, 1)
      this.db.write()

      const foundIndex2 = _findIndex(this.todos, { id: todo.id })
      this.$delete(this.todos, foundIndex2)
    },
    changeFilter(filter) {
      this.filter = filter
    },
    completeAll(checked) {
      /**
       * 강의 버전(lowdb 1.0.0)
       */
      // this.db
      //   .get('todos')
      //   .forEach(todo => {
      //     todo.done = checked
      //   })
      //   .write()

      // this.todos.forEach(todo => {
      //   todo.done = checked
      // })

      /**
       * 강의 버전(lowdb 1.0.0)
       * db를 갱신하고 나온 결과를 가지고 Local.todos에 대입하는 버전
       */
      // const newTodos = this.db
      //   .get('todos')
      //   .forEach(todo => {
      //     todo.done = checked
      //   })
      //   .write()

      // this.todos = _cloneDeep(newTodos)
      this.db.data.todos.forEach(todo => {
        todo.done = checked
      })
      this.db.write()
      this.todos.forEach(todo => {
        todo.done = checked
      })
    },
    clearCompleted() {
      // this.todos
      //   .reduce((list, todo, index) => {
      //     if (todo.done) {
      //       list.push(index)
      //     }
      //     return list
      //   }, [])
      //   .reverse()
      //   .forEach(index => {
      //     this.deleteTodo(this.todos[index])
      //   })

      // 위의 버전을 Lodash로 간편하게 해보자!
      _forEachRight(this.todos, todo => {
        if (todo.done) {
          this.deleteTodo(todo)
        }
      })
    },
    scrollToTop() {
      scrollTo(0, 0, {
        ease: 'linear',
        duration: 1000 // 디폴트 1초(삭제 가능)
      })
    },
    scrollToBottom() {
      scrollTo(0, document.body.scrollHeight, {
        ease: 'linear'
      })
    }
  }
}
</script>

<style lang="scss">
@import '../scss/style';
</style>
