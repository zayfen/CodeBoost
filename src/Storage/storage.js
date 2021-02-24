/**
 * @description: 存储工具
 * @author: zayfen<zhangyunfeng0101@gmail.com>
 */

export class Storage {
  /**
   * 
   * @param {string} engine - 枚举值  "SESSION_STORAGE" 或者 "LOCAL_STORAGE"
   */
  constructor (engine) {
    this.engine = engine
  }

  static get Engine () {
    return {
      SESSION_STORAGE: sessionStorage,
      LOCAL_STORAGE: localStorage
    }
  }

  /**
   * 获取存储引擎
   */
  getEngine () {
    const engine = Storage.Engine[this.engine]
    if (!engine) {
      throw new Error('invalid storage engine: ' + this.engine)
    }

    return engine
  }

  /**
   * 将要存储的值转换成 TypeValue的形式 {type: string, value: string }
   * @param {object | number | string} value - 要存储的值
   * @returns {{ type: string, value: object | string | number }}
   */
  valueToTypeValue (value) {
    const validValueTypes = ['object', 'number', 'string']
    const type = typeof value
    if (!validValueTypes.indexOf(type)) {
      throw new Error('invalid value type: ' + type)
    }

    const makeValue = (type, value) => Object.assign(Object.create(null), { type, value })

    if (type === 'object') {
      value = value !== null ? makeValue(type, value) : makeValue('NULL', '')

    } else if (type === 'number' && !(value === value)) {
      value = makeValue(type, '' + value)

    } else if (type === 'number') { // Not a Number
      value = makeValue('NaN', '')

    } else { // string
      value = makeValue(type, value)
    }

    return value
  }


  /**
   * 
   * @param {{type: string, value: string | object | number }} data
   * @returns object | number | string
   */
  typeValueToValue (data) {
    let type = data.type
    switch (type) {
      case 'object':
        data = data.value
        break
      case 'NULL':
        data = null
        break
      case 'number':
        data = +data.value
        break
      case 'NaN':
        data = NaN
        break
      case 'string':
        data = data.value
        break
      default:
        throw new Error('invalid data type: ' + type)
    }

    return data
  }  

  /**
   * 通过key获取储存的数据（JSON.parse后的数据）
   * @param {string} key - key
   * @returns {{ type: string, value: object | string | number }}
   */
  getTypeValue (key) {
    const data = this.getEngine().getItem(key)
    if (!data) {
      return null
    }
    return JSON.parse(data)
  }

  /**
   * 存储值
   * @param {string} key - 存储的key
   * @param {object | number | string} value - 存储的value
   */
  set (key, value) {
    value = this.valueToTypeValue(value)
    this.getEngine().setItem(key, JSON.stringify(value))
  }

  /**
   * 获取值
   * @param {string} key 
   * @param {any} defaultValue 
   */
  get (key, defaultValue = null) {
    let data = this.getTypeValue(key)
    if (!data) {
      return defaultValue
    }

    return this.typeValueToValue(data)
  }

  /**
   * 存储带有存活时间的数据
   * @param {string} key - key
   * @param {object|string|number} value - value
   * @param {number} expireMs - 数据的存活时间（单位：毫秒）
   */
  setEx (key, value, expireMs/*过期时间，毫秒*/ = 24 * 60 * 60 * 1000) { 
    const data = { 
      updateTimestamp: Date.now(),
      expireMs,
      ...this.valueToTypeValue(value)
    }
    this.getEngine().setItem(key, JSON.stringify(data))
  }

  /**
   * 获取带有存活时间的数据，如果过期了，返回null，切删除过期数据
   * @param {string} key - key
   */
  getEx (key) {
    const now = Date.now()
    const data = this.getTypeValue(key)
    // 数据为空 或者 获取的数据没有过期时间
    if (data === null || !data.updateTimestamp) {
      return data
    }

    const updateTimestamp = +data.updateTimestamp
    const expireMs = +data.expireMs
    const expired = (now - updateTimestamp) > expireMs
    
    if (expired) {
      this.remove(key)
      return null
    }

    return this.typeValueToValue(data)
  }

  /**
   * 删除数据
   * @param {string} key 
   */
  remove (key) {
    this.getEngine().removeItem(key)
  }
}