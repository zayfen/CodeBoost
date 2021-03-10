/**
 * @description  优化性能相关的工具
 * @author zayfen<zhangyunfeng0101@gmail.com>
 */


export class Performance {

  /**
   * 防抖，防止连续的执行动作
   * 对于连续的动作触发(频率 > 1000/delay)，只在最后一次触发之后，delay时间过去之后，才执行动作
   */
  public static debounce (fn: Function, delay: number): Function {
    let timer = null
    return function () {
      const context = this
      const args = arguments
      clearTimeout(timer)
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay)
    }
  }


  /**
   * 节流
   * 对于连续的动作触发， 只在固定的时间间隔执行一次动作
   */
  public static throttle (fn: Function, limit: number, immediate: boolean = false) {
    let timer = null
    let lastActionTime = 0

    return function () {
      const context = this
      const args = arguments
      const now = Date.now()

      if (lastActionTime == 0) {
        lastActionTime = immediate ? now - limit : now
      }

      const passedTimeFromLastAction = now - lastActionTime
      const leftTimeToNextAction = passedTimeFromLastAction >= limit ? 0 : limit - passedTimeFromLastAction
      clearTimeout(timer)
      timer = setTimeout(() => {
        lastActionTime = Date.now()
        fn.apply(context, args)
      }, leftTimeToNextAction)
    }
    
  }

}