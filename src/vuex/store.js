import applyMxin from './mixin'
import ModuleCollection from './module/module-collection'
import { forEach } from './util'
let Vue


function installModule(store, rootState, path, module) {
   // 注册事件时 需要注册对应的命名空间中 path就是所有的路径 根据path算出一个空间来
  console.log('store', store._modules); 
  let namespace = store._modules.getNamespace(path)
  console.log(namespace)

  if (path.length) { // 子模块
    // 将子模块的状态定到跟模块上
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current]
    }, rootState)

    // Vue.set() 可以新增属性 如果本身不是响应式会直接复制
    // Vue.set会区分是否是响应式数据
    Vue.set(parent, path[path.length - 1], module.state)
    console.log('parent', parent)
  }

  module.forEachGetters((getter, key) => {
    // 所有模块的getter都会添加到跟模块上，重名会覆盖
    return store._wrappedGetters[namespace + key] = function () {
      return getter(module.state)
    }
  })

  module.forEachMutations((mutation, type) => {
    if (!store._mutations[namespace + type]) {
      store._mutations[namespace + type] = []
    }
    store._mutations[namespace + type].push((payload) => {
      mutation.call(store, module.state, payload)
    })
  })

  module.forEachActions((action, type) => {
    if (!store._actions[namespace + type]) {
      store._actions[namespace + type] = []
    }
    store._actions[namespace + type].push((payload) => {
      action.call(store, store, payload)
    })
  })

  module.forEachChildren((child, key) => {
    installModule(store, rootState, [...path, key], child)
  })
}

function resetStoreVm(store, state) {
  const _wrappedGetters = store._wrappedGetters
  let oldVm = store._vm
  let computed = {}
  store.getters = {}

  // 将getter定义在store上，使用计算属性实现缓存效果
  forEach(_wrappedGetters, (fn, key) => {
    computed[key] = function () {
      return fn()
    }

    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key]
    })
  })

  // 将状态变成响应式
  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })

  if (oldVm) {
    Vue.nextTick(() => oldVm.$destroy())
  }
}

class Store {
  constructor(options) {
    // 一、收集模块（转换成树）
    // 格式化用户传入参数
    // 格式化成树形结构 直观好操作
    this._modules = new ModuleCollection(options)
    console.log(this._modules)

    // 安装模块 将模块上的属性 定义在store中
    let state = this._modules.root.state

    this._mutations = {} // 存放所有模块中的mutations
    this._actions = {} // 存放所有模块中的actions
    this._wrappedGetters = {} // 存放所有模块中的getters
    installModule(this, state, [], this._modules.root)
    console.log(state);
    // 将状态加入到Vue实例中
    resetStoreVm(this, state)
  }

  commit = (type, payload) => {
    this._mutations[type].forEach(fn => fn(payload))
  }

  dispatch = (type, payload) => {
    this._actions[type].forEach(fn => fn((payload)))
  }

  get state() {
    return this._vm._data.$$state
  }

  registerModule(path, rawModule) {
    if (typeof path === 'string') {
      path = [path]
    }

    // 注册模块
    this._modules.register(path, rawModule)

    // 安装模块 动态将状态新增上去
    installModule(this, this.state, path, rawModule.rawModule)

    // 将getters映射到了wrappedGetters上了，并没有映射到store上的getters
    // 重新定义getters
    resetStoreVm(this, this.state)
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


// 1. 默认模块没有 作用域问题
// 2. 状态不要和模块的名称相同 （同名时模块会覆盖状态
// 3. 默认计算属性 直接通过getters取值
// 4. namespace: true 会将模块的属性 都封装到这个作用域下
// 5. 默认会找当前当前模块上是否有namespace，并且将父级的namespace 一同算上，做成命名空间


 // // options ==> new Vue.Store({})的{}
    // let { state, getters, mutations, actions } = options // 用户传递过来的
    
    // this.getters = {}
    // // getter写的是方法，取值的时候是属性
    // const computed = {};
    // forEach(getters, (fn, key) => {
    //   // 通过计算属性实现懒加载
    //   computed[key] = () => {
    //     return fn(this.state)
    //   }
    //   Object.defineProperty(this.getters, key, {
    //     get: () => this._vm[key]
    //   })
    // })
    
    // // vue中定义的数据 属性名如果是以$开头的 是不会被代理到vue实例上的
    // // $$表示内部的状态
    // this._vm = new Vue({
    //   data: {
    //     $$state: state
    //   },
    //   computed, // 计算属性会把自己的属性放到实例上
    // })

    // // 发布订阅模式
    // // 将用户定义的mutation和action先保存起来
    // // 当调用commit的时候找订阅的mutation方法
    // // 当调用dispatch的时候找订阅的action方法
    // this._mutations = {}
    // forEach(mutations, (fn, key) => {
    //   this._mutations[key] = (payload) => fn.call(this, this.state, payload)
    // })

    // this._actions = {}
    // forEach(actions, (fn, key) => {
    //   this._actions[key] = (payload) => fn.call(this, this, payload)
    // })
