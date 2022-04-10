import Vue from 'vue'
import Vuex from 'vuex'

function presists(store) {
  let local = localStorage.getItem('VUEX:STATE')

  if (local) {
    store.replaceState(JSON.parse(local))
  }

  store.subscribe((mutation, state) => {
    localStorage.setItem('VUEX:STATE', JSON.stringify(state))
  })
}


Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    presists
  ],
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
    changeAge(state, payload) {
      state.age += payload
    }
  },
  actions: {
    changeAge({ state, commit }, payload) {
      setTimeout(() => {
        commit('changeAge', payload)
      }, 1000)
    }
  },
  modules: {
    a: {
      namespaced: true,
      state: {
        a1: 1,
        a2: 2
      },
      modules: {
        AA: {
          namespaced: true
        },
        AB: {}
      }
    },
    b: {
      namespaced: true,
      state: {
        b1: 11,
        b2: 12
      }
    }
  }
})
