export default class DOMEventer {
  constructor(name) {
    this._name = name;

    this._subscriptions = {};
    this._recentId = Date.now();
  }

  use(name) {
    return (...args) => {
      return this[name](...args);
    };
  }

  on(...args) {
    this.use('listen').apply(this, args);
  }

  off(...args) {
    this.use('remove').apply(this, args);
  }

  once(...args) {
    this.use('listen').apply(this, [...args, 1]);
  }

  isValidListener(cb) {
    return typeof cb === 'function';
  }

  updateHitCount(id) {
    if (this._subscriptions[id]) {
      const { hit, limit } = this._subscriptions[id];
      this._subscriptions[id].hit += 1;

      if (hit === limit) {
        this.remove(id);
      }
    }
  }

  listen(target, eventType, cb, limit) {
    if (!this.isValidListener(cb)) {
      throw new TypeError('listener must be a function');
    }

    const id = `${eventType}.${this._recentId + 1}`;
    this._recentId += 1;

    const wrapperCb = ((id, that) => {
      return function (...args) {    // should not be bind.
        that.updateHitCount(id);
        cb(...args);
      };
    })(id, this);

    this._subscriptions[id] = {
      limit,
      hit: 0,
      type: eventType,
    };

    if (target.addEventListener) {
      target.addEventListener(eventType, wrapperCb, false);

      this._subscriptions[id].remove = () => {
        target.removeEventListener(eventType, wrapperCb, false);
      };
    } else if (target.attachEvent) {
      target.attachEvent(`on${eventType}`, wrapperCb);

      this._subscriptions[id].remove = () => {
        target.detachEvent(`on${eventType}`, wrapperCb);
      };
    }

    return id;
  }

  remove(id) {
    if (this._subscriptions[id]) {
      this._subscriptions[id].remove();
      this._subscriptions[id].isRemove = true;
    }
  }

  removeAll() {
    const ids = Object.keys(this._subscriptions);
    ids.forEach((id) => {
      this.remove(id);
    });
  }
}
