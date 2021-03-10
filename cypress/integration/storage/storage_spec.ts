/// <reference types="cypress" />
import { Storage } from '../../../src/Storage/storage'

function delay (ms: number) {
  let now = Date.now()
  while (true) {
    if (Date.now() - now > ms) {
      return
    }
  }
}

context('Storage Test', () => {
  const storage = new Storage(localStorage)
  it('Storage.set and Storage.get', () => {
    storage.set('key', {name: 'zayfen', age: 18})
    let data = storage.get('key')
    expect(data).to.deep.equal({name: 'zayfen', age: 18})
  })

  it('Store.get return default value', () => {
    let data = storage.get('not-existed-key', 100)
    expect(data).to.equal(100)
  })

  it('Storage.setEx and Storage.getEx', () => {
    storage.setEx('ex-key', {name: 'zayfen', age: 18}, 1000)
    
    delay(2000)

    let data = storage.getEx('ex-key')
    console.log('Storage.setEx and Storage.getEx: ', data)
    expect(data).to.deep.equal(null)
  })
})