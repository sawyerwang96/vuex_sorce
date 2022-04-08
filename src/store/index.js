import Vue from 'vue'
import Vuex from '../vuex/index'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    name: 'wsy',
    age: 18,
    a: 1
  },
  getters: {
    getAge(state) {
      console.log('???')
      return state.age + 'years'
    }
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
