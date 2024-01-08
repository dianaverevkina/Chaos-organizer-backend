export default class Store {
  constructor() {
    this.messages = [];
    this.links = [];
    this.files = [];
  }

  getTimestamp() {
    const time = new Date().toLocaleTimeString();
    return `${time.slice(0, 5)}`;
  }

  getFulldate() {
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    return `${date} ${time.slice(0, 5)}`;
  }

  getTenMessages(limit, lastMessage = 0) {
    const lastIndex = !lastMessage ? this.messages.length : this.messages.findIndex(mes =>{
      return mes.message.id === lastMessage
    } );

    if (lastIndex <= 0) return;

    let firstMessageIndex = Math.max(0, lastIndex - limit);
    
    if (firstMessageIndex === 0) {
        // Если первое сообщение не является началом массива, возвращаем оставшиеся сообщения
        return this.messages.slice(0, lastIndex).reverse();
    } else {
        return this.messages.slice(firstMessageIndex, lastIndex).reverse();
    }
  }

  addLink(arr) {
    arr.forEach(link => {
      const date = this.getTimestamp();
      this.links.push({ link, date });
    });
  }

  formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) {
      return '0';
    } else {
      var k = 1024;
      var dm = decimals < 0 ? 0 : decimals;
      var sizes = ['байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
      var i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
  }
}