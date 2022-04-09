import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

store.registerModule(['registerA'], {
  state: {
    Ra: 1
  },
  getters: {
    getRa(state) {
      return state.Ra + 'Ra'
    }
  }
})

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
