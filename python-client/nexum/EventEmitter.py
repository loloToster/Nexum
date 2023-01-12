from typing import Union, Callable


class EventEmitter:
  _handlers: dict[str, list[Callable]]

  def __init__(self):
    self._handlers = {} 

  def _attach(self, ev: str, cb: Callable):
    if not ev in self._handlers:
      self._handlers[ev] = [cb]
    else: 
      self._handlers[ev].append(cb)

    return cb

  def emit(self, ev: str, *args, **kwargs):
    if not ev in self._handlers:
      return

    for h in self._handlers[ev]:
      h(*args, **kwargs)

  def on(self, ev_or_cb: Union[str, Callable]):
    if callable(ev_or_cb):
      ev = ev_or_cb.__name__
      return self._attach(ev, ev_or_cb)
    else:
      def wrapper(cb):
        return self._attach(ev_or_cb, cb)

      return wrapper

  def off(self, ev: str, cb: Callable):
    if not ev in self._handlers:
      return

    try:
      self._handlers[ev].remove(cb)
    except ValueError:
      pass
