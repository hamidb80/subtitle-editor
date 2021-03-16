export class WindowStates<T> { // global state: just a data wrapper
  data: T
  constructor(given_data: T) {
    this.data = given_data
  }

  getData(): T {
    return this.data
  }

  setData(new_val: T) {
    this.data = new_val
  }
}