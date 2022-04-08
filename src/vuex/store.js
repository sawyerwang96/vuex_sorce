import applyMxin from './mixin'

let Vue

class Store {
  constructor(options) {
    // options ==> new Vue.Store({})的{}
    let state = options.state // 用户传递过来的state

    // vue中定义的数据 属性名如果是以$开头的 是不会被代理到vue实例上的
    // $$表示内部的状态
    this._vm = new Vue({
      data: {
        $$state: state
      }
    })
  }

  get state() {
    return this._vm._data.$$state
  }
}

/**
 * install的作用
 * 注册全局组件
 * 注册原型方法
 * mixin => router实例绑定给所有的组件
 * @param {*} _Vue 
 */
const install = (_Vue) => {
  Vue = _Vue
  console.log('install')
  applyMxin(Vue)
}

export {
  Store,
  install
}