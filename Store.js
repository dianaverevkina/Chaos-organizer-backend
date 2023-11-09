export default class Store {
  constructor() {
    this.messages = [];
    this.links = [];
    this.files = [];
  }

  getTimestamp() {
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    return `${time.slice(0, 5)}`;
  }

  addLink(arr) {
    arr.forEach(link => {
      const date = this.getTimestamp();
      this.links.push({ link, date });
    });
  }
}