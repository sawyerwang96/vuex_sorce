import { forEach } from '../util'

export default class ModuleCollection {
  constructor(options) {
    // 注册模块 递归注册 根模块
    this.register([], options)
  }

  // 和ast解析一样
  register(path, rootModule) {
    let newModule = {
      _row: rootModule,
      state: rootModule.state,
      _children: {}
    }

    if (0 == path.length) {
      this.root = newModule
    } else {
      let parent = path.slice(0, -1).reduce((memo, current) => {
        return memo._children[current]
      }, this.root)

      parent._children[path[path.length - 1]] = newModule
    }

    if (rootModule.modules) {
      // 有modules说明有子模块
      forEach(rootModule.modules, (module, moduleName) => {
        this.register([...path, moduleName], module)
      })
    }
  }
}

// 格式化树形结构
// this.root = {
//   _roe: 'xxx',
//   state: {},
//   _children: {
//     a: {
//       _row: 'xxx',
//       state: {}
//     },
//     b: {
//       _row: 'xxx',
//       state: {},
//       _children: {}
//     }
//   }
// }