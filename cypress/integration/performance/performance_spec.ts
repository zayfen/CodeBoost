import { Performance } from '../../../src/Performance/performance'


context("CodeBoost.Performance", () => {

  it('Performance.debounce', (done) => {
    let counter = 0
    function increaseCounter () {
      counter++
    }

    let f = Performance.debounce(increaseCounter, 50)
    for (let i = 0; i < 100; i++) {
      f()
    }
    setTimeout(() => {
      console.log("counter: ", counter)
      expect(counter).to.eq(1)
      done()
    }, 50)
  })

  it('Performance.throttle', (done) => {
    let counter = 0
    function increseCounter () {
      counter++
    }

    let f = Performance.throttle(increseCounter, 50, true)
    f()
    setTimeout(() => {
      expect(counter).to.eq(1, "test immediate call")
    }, 0)

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        f()
      }, 25)
    }
    setTimeout(() => {
      expect(counter).to.eq(2)
      done()
    }, 200)
  })
})