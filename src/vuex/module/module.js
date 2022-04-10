import { forEach } from "../util"

export default class Module {
  constructor(rootModule) {
    this._rowModule = rootModule
    this._children = {}
    this.state = rootModule.state
  }

  get namespaced() {
    return this._rowModule.namespaced
  }

  getChild(key) {
    return this._children[key]
  }

  addChild(key, module) {
    this._children[key] = module
  }

  forEachGetters(fn) {
    if (this._rowModule.getters) {
      forEach(this._rowModule.getters, fn)
    }
  }

  forEachMutations(fn) {
    if (this._rowModule.mutations) {
      forEach(this._rowModule.mutations, fn)
    }
  }

  forEachActions(fn) {
    if (this._rowModule.actions) {
      forEach(this._rowModule.actions, fn)
    }
  }

  forEachChildren(fn) {
    forEach(this._children, fn)
  }
}
