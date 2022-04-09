import applyMxin from './mixin'
import { forEach } from './util'
let Vue

class Store {
  constructor(options) {
    // options ==> new Vue.Store({})的{}
    let { state, getters, mutations, actions } = options // 用户传递过来的
    
    this.getters = {}
    // getter写的是方法，取值的时候是属性
    const computed = {};
    forEach(getters, (fn, key) => {
      // 通过计算属性实现懒加载
      computed[key] = () => {
        return fn(this.state)
      }
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key]
      })
    })
    
    // vue中定义的数据 属性名如果是以$开头的 是不会被代理到vue实例上的
    // $$表示内部的状态
    this._vm = new Vue({
      data: {
        $$state: state
      },
      computed, // 计算属性会把自己的属性放到实例上
    })

    // 发布订阅模式
    // 将用户定义的mutation和action先保存起来
    // 当调用commit的时候找订阅的mutation方法
    // 当调用dispatch的时候找订阅的action方法
    this._mutations = {}
    forEach(mutations, (fn, key) => {
      this._mutations[key] = (payload) => fn.call(this, this.state, payload)
    })

    this._actions = {}
    forEach(actions, (fn, key) => {
      this._actions[key] = (payload) => fn.call(this, this, payload)
    })

  }

  commit = (type, payload) => {
    this._mutations[type](payload)
  }

  dispatch = (type, payload) => {
    this._actions[type](payload)
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