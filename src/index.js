const eventsCache = []

// backup old handlers
const { addEventListener: _addEventListener } = Element.prototype
const { removeEventListener: _removeEventListener } = Element.prototype

// new handler for adding listeners
function _addListener(type, handler, useCapture) {
  if (_eventExists(this, type, handler, useCapture) === false) {
    eventsCache.push({
      target: this,
      type: type,
      handler: handler,
      useCapture: useCapture
    })
  }

  _addEventListener.call(this, type, handler, useCapture)
}

// check if event is in cache
function _eventExists(target, type, handler, useCapture) {
  var e, len = eventsCache.length, i
  for (i = 0; i < len; i++) {
    e = eventsCache[i]

    if (e.target === target && e.type === type && e.handler === handler && e.useCapture === useCapture) {
      return i
    }
  }

  return false
}

// new handler for removing listeners
function _removeListener(type, handler, useCapture) {

  var pos = _eventExists(this, type, handler, useCapture)
  if (pos !== false && pos < eventsCache.length) {
    eventsCache.splice(pos, 1)
  }

  _removeEventListener.call(this, type, handler, useCapture)
}


// switch to new handlers
Element.prototype.addEventListener = _addListener
Element.prototype.removeEventListener = _removeListener
// get current element listeners
Element.prototype.getEventListeners = function () {
  var listeners = [], len = eventsCache.length, i
  for (i = 0; i < len; i++) {
    if (eventsCache[i].target === this) {
      listeners.push(eventsCache[i])
    }
  }
  return listeners
}

document.__proto__.addEventListener = _addListener
document.__proto__.removeEventListener = _removeListener
document.__proto__.getEventListeners = Element.prototype.getEventListeners

// get all registered listeners
export function getAllEventListeners() {
  return eventsCache
}

// get listeners of an element
export function getEventListeners(el) {
  return el.getEventListeners.bind(el)
}

window.getAllEventListeners = getAllEventListeners
window.getEventListeners = getEventListeners
