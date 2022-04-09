export default class Module {
  constructor(rootModule) {
    this.rootModule = rootModule
    this._children = {}
    this.state = rootModule.state
  }

  getChildren(key) {
    return this._children[key]
  }

  addChildren(key, module) {
    this._children[key] = module
  }
}
