class WindowStates<T> {
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

export { WindowStates }