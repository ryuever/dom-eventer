# dom-eventer

A utility to control the occurence of DOM eventer

## Example
```js
this.eventer = new DOMEventer('brand');
this.eventer.listen(window, 'scroll', this.handleScroll);
this.eventer.removeAll();
```
