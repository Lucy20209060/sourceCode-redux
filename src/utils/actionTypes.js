/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 * 
 * 这些是Redux预留的私人行为类型。
 * 对于任何未知的动作，必须返回当前状态。
 * 如果当前状态未定义，则必须返回初始状态。
 * 不要在代码中直接引用这些操作类型。
 * 
 * redux自己创建的action 用来初始化状态树 和 reducer 改变后初始化状态树
 */
const ActionTypes = {
  INIT:
    '@@redux/INIT' +
    Math.random()
      .toString(36)
      .substring(7)
      .split('')
      .join('.'),
  REPLACE:
    '@@redux/REPLACE' +
    Math.random()
      .toString(36)
      .substring(7)
      .split('')
      .join('.')
}

export default ActionTypes
