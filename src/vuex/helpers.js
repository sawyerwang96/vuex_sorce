export const mapState = (stateList) => {
  let result = {}
  for (let i = 0, len = stateList.length; i < len; i++) {
    let stateName = stateList[i]
    result[stateName] = function () {
      return this.$store.state[stateName]
    }
  }

  return result
}

export const mapGetters = (getterList) => {
  let result = {}
  for (let i = 0, len = getterList.length; i < len; i++) {
    let getterName = getterList[i]
    result[getterName] = function () {
      return this.$store.getters[getterName]
    }
  }

  return result
}

export const mapMutations = (mutationList) => {
  let result = {}

  for (let i = 0, len = mutationList.length; i < len; i++) {
    let mutationName = mutationList[i]
    result[mutationName] = function (payload) {
      this.$store.commit(mutationName, payload)
    }
  }

  return result
}

export const mapActions = (actionList) => {
  let result = {}

  for (let i = 0, len = actionList.length; i < len; i++) {
    let actionName = actionList[i]
    result[actionName] = function (payload) {
      this.$store.dispatch(actionName, payload)
    }
  }


  return result
}
