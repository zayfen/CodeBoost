import { Storage } from '../../src/Storage/storage.js'

describe('Storage Test', () => {
  const storage = new Storage('LOCAL_STORAGE')
  it('Storage.set(Object) and Storage.get', () => {
    storage.set('key', {name: 'zayfen', age: 18})
    let data = storage.get('key')
    expect(data.name).to.equal('zayfen')
    expect(data.age).to.equal(18)
  })
})