/**
 * @description: 存储工具
 * @author: zayfen<zhangyunfeng0101@gmail.com>
 */

export type ValueType = number | string | Object
export type ValueTransformType = { 
  updateTimestamp?: number,
  expireMs?: number,
  type: string, 
  value: ValueType 
}

export interface StorageEngine {
  getItem(key: string): string,
  setItem(key: string, value: ValueType): void,
  removeItem(key: string): void
}


export class Storage<T extends StorageEngine> {
  engine: T = null

  /**
   * 
   * @param {string} engine - 枚举值  "SESSION_STORAGE" 或者 "LOCAL_STORAGE"
   */
  constructor (engine: T) {
    this.engine = engine
  }

  /**
   * 获取存储引擎
   */
  getEngine (): T {
    return this.engine
  }

  /**
   * 将要存储的值转换成 TypeValue的形式 {type: string, value: string }
   * @param {object | number | string} value - 要存储的值
   * @returns {{ type: string, value: object | string | number }}
   */
  valueToTypeValue (value: ValueType): ValueTransformType {
    const validValueTypes = ['object', 'number', 'string']
    const type = typeof value
    if (validValueTypes.indexOf(type) < 0) {
      throw new Error('invalid value type: ' + type)
    }

    const makeValue = (type: string, value: ValueType): ValueTransformType => Object.assign(Object.create(null), { type, value })
    let transformValue: ValueTransformType = null
    if (type === 'object') {
      transformValue = value !== null ? makeValue(type, value) : makeValue('NULL', '')

    } else if (type === 'number' && !(value === value)) {
      transformValue = makeValue(type, '' + value)

    } else if (type === 'number') { // Not a Number
      transformValue = makeValue('NaN', '')

    } else { // string
      transformValue = makeValue(type, value)
    }

    return transformValue
  }


  /**
   * 
   * @param {{type: string, value: string | object | number }} data
   * @returns object | number | string
   */
  typeValueToValue (data: ValueTransformType): ValueType {
    let type = data.type
    let value: ValueType = null
    switch (type) {
      case 'object':
        value = data.value
        break
      case 'NULL':
        data = null
        break
      case 'number':
        value = +data.value
        break
      case 'NaN':
        value = NaN
        break
      case 'string':
        value = data.value
        break
      default:
        throw new Error('invalid data type: ' + type)
    }

    return value
  }  

  /**
   * 通过key获取储存的数据（JSON.parse后的数据）
   * @param {string} key - key
   * @returns {{ type: string, value: object | string | number }}
   */
  getTypeValue (key: string): ValueTransformType {
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
  set (key: string, value: ValueType) {
    let valueTransform = this.valueToTypeValue(value)
    this.getEngine().setItem(key, JSON.stringify(valueTransform))
  }

  /**
   * 获取值
   * @param {string} key 
   * @param {any} defaultValue 
   */
  get (key: string, defaultValue = null): ValueType {
    let data: ValueTransformType = this.getTypeValue(key)
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
  setEx (key: string, value: ValueType, expireMs: number/*过期时间，毫秒*/ = 24 * 60 * 60 * 1000): void { 
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
  getEx (key: string): ValueType {
    const now = Date.now()
    const data = this.getTypeValue(key)
    // 数据为空 或者 获取的数据没有过期时间
    if (data === null || !data.updateTimestamp) {
      return data
    }

    const updateTimestamp = +data.updateTimestamp
    const expireMs = +data.expireMs
    const expired = (now - updateTimestamp) > expireMs
    console.log(`getEx(${key}): now: ${now}; updateTimestamp: ${updateTimestamp}; now-updateTimestamp: ${now - updateTimestamp}; expireMs: ${expireMs}; expired: ${expired}`)
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
  remove (key: string): void {
    this.getEngine().removeItem(key)
  }
}