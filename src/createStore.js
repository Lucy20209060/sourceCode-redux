import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
export default function createStore(reducer, preloadedState, enhancer) {
  // 如果第二个参数为方法 且第三个参数是空 则将两个参数交换
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // enhancer 必须为 function 类型
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    // 将 enhancer 包装一次 createStore 方法 再调用无 enhancer 的 createStore 方法
    return enhancer(createStore)(reducer, preloadedState)
  }
  // reducer 必须为 function 类型
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  // 当前的reducer函数
  let currentReducer = reducer
  // 当前state树
  let currentState = preloadedState
  // 监听函数列表
  let currentListeners = []
  // 当前列表的一个引用
  let nextListeners = currentListeners
  // 是否正在dispatch
  let isDispatching = false

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */

  // 返回当前的 state 树
  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */

  // 添加注册一个监听函数 返回一个可以取消监听的方法
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
      )
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
        )
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */

  // 替换当前的reducer
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.

  //当创建一个 store 时，将发送一个“init”动作，以便每个 reducer 返回它们的初始状态。这有效地填充了初始状态树。
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}

/**
 * createState 接受三个参数
 *  reducer 这个参数是一个函数 返回下一个state树
 *  preloadedState 初始化的state
 *  enhancer 第三个参数是一个store增强器 函数类型 只能使用 applyMiddleware 方法来生成
 * 这个方法最终生一个对象 对象中包含了一个重要的成员变量 即state树 暴露了几个成员方法
 * 
 * dispatch redux中唯一触发state树修改的方法 分发一个action 然后在该action对应的处理函数中返回一个新的state树
 * subscribe 给store的状态树添加监听函数 一旦dispatch被调用 所有的监听函数会被执行
 * getState 返回当前的状态树
 * replaceReducer 替换当前的store中的reducer的方法
 * [$$observable]: observable
 * 
 */

上述代码 可以看出createStore方法最终return了几个方法 通过闭包的原理 内部的各个变量也就被持久化的存储了 
而通过暴露的getState,dispatch等函数 我们可以获取或者改变其内部的state。


getState 
返回当前的状态树

function getState() {
   return currentState
}


subscribe 
这个函数用于给store添加监听函数 把需要添加的监听函数作为参数传入即可
nextListeners即为目前的监听函数列表 添加之后 subscribe方法会返回一个 unsubscribe()方法
此方法用于注销添加的监听函数

function subscribe(listener) {
  if (typeof listener !== 'function') {
    throw new Error('Expected listener to be a function.')
  }

  let isSubscribed = true

  ensureCanMutateNextListeners()
  nextListeners.push(listener)

  return function unsubscribe() {
    if (!isSubscribed) {
      return
    }

    isSubscribed = false

    ensureCanMutateNextListeners()
    const index = nextListeners.indexOf(listener)
    nextListeners.splice(index, 1)
  }
}

dispatch
它可能是我们用的最多的函数 它只是执行了当前的reducer方法 
然后把当前的state和你在调用dispatch时传入的action作为参数返回的值就是新的currentState 
从这里我们可以看出 改变state的代码逻辑就在reducer方法中
在这执行后 dispatch方法会遍历当前的监听列表 并执行所有的监听函数

function dispatch(action) {
  //action必须是一个包含type的对象
  if (!isPlainObject(action)) {
    throw new Error(
      'Actions must be plain objects. ' +
      'Use custom middleware for async actions.'
    )
  }

  if (typeof action.type === 'undefined') {
    throw new Error(
      'Actions may not have an undefined "type" property. ' +
      'Have you misspelled a constant?'
    )
  }

  //如果正处于isDispatching状态，报错
  if (isDispatching) {
    throw new Error('Reducers may not dispatch actions.')
  }

  try {
    isDispatching = true
    //这里就是调用我们reducer方法的地方，返回一个新的state作为currentState
    currentState = currentReducer(currentState, action)
  } finally {
    isDispatching = false
  }

  //调用所有的监听函数
  const listeners = currentListeners = nextListeners
  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i]
    listener()
  }

  return action
}

replaceReducer
dispatch({type:ActionTypes.INIT}) 是替换reducer之后重新初始化状态树

function replaceReducer(nextReducer) {
  if (typeof nextReducer !== 'function') {
    throw new Error('Expected the nextReducer to be a function.')
  }

  currentReducer = nextReducer
  dispatch({ type: ActionTypes.INIT })
}

observable
这个方法用于提供观察者模式的操作

function observable() {
  const outerSubscribe = subscribe
  return {
    subscribe(observer) {
      if (typeof observer !== 'object') {
        throw new TypeError('Expected the observer to be an object.')
      }

      function observeState() {
        //观察者模式的链式结构，传入当前的state
        if (observer.next) {
          observer.next(getState())
        }
      }

      observeState()
      const unsubscribe = outerSubscribe(observeState)
      return { unsubscribe }
    },

    [$$observable]() {
      return this
    }
  }
}