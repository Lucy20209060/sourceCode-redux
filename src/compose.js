/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

非常简洁的代码 最后一句 非常函数式的一句代码
先看reduce方法
reduce接受两个参数 第一个参数是一个callback函数 第二个是一个初始值 initValue

第一个函数有四个参数

previousValue：上一次调用callback时返回的值
currentValue:正在处理的数组元素
index：正在处理的数组元素下标
array:被处理的数组

如果有initValue，initValue将作为第一次的previousValue
若没有 则数组第一个元素将作为previousValue 后面一个元素将作为currentValue
然后执行callback的函数体 将返回的值作为previousValue
将下一个元素作为currentValue 一直到最后一个数组最后一个元素执行完位置 再返回最终的结果

比如 arr = [1,2,3,4,5] 使用reduce求和
let sun = [1,2,3,4,5].reduce((a,b) =>a+b))

compose巧妙的在于每个元素都是函数 callback返回一个复合函数作为previousValue
在reduce 方法执行后 也就返回了一个将整个数组中所有函数串式调用的一个函数 