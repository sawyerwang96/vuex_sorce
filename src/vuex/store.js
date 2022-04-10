import applyMxin from './mixin'
import ModuleCollection from './module/module-collection'
import { forEach } from './util'
let Vue

function getNestedState(store, path) {
  return path.reduce((newState, current) => {
    return newState[current]
  }, store.state)
}

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
    store._withCommitting(() => {
      Vue.set(parent, path[path.length - 1], module.state)
    })
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
      // 内部可能会替换状态 如果一折使用module.state 就有可能老的状态
      // mutation.call(store, module.state, payload)

      store._withCommitting(() => {
        mutation.call(store, getNestedState(store, path), payload)
      })
      
      // 调用订阅的事件
      store._subscribers.forEach(sub => sub({ mutation, type }, store.state))
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

  if (store.strict) {
    // 只要状态一变化就会立即执行，状态变化后同步执行
    store._vm.$watch(() => store._vm._data.$$state, () => {
      console.assert(store._committing, '在mutation以外更改了状态')
    }, { deep: true, sync: true })
  }

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
    this._subscribers = []

    this.strict = options.strict // 是否开启严格模式（严格模式下只能通过提交mutation修改state，否则会报错）
    this._committing = false // 同步监听


    installModule(this, state, [], this._modules.root)
    console.log(state);
    // 将状态加入到Vue实例中
    resetStoreVm(this, state)

    options.plugins.forEach(plugin => plugin(this))
  }

  _withCommitting(fn) {
    let committing = this._committing
    this._committing = true // 函数调用前 标识_committing为true
    fn()
    this._committing = committing // 恢复原值
  }

  subscribe(fn) {
    this._subscribers.push(fn)
  }

  replaceState(newState) {
    this._withCommitting(() => {
      this._vm._data.$$state = newState
    })
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
