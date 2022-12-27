import socketio
from typing import Union

class Client:
  host: str
  token: str

  _socket: socketio.Client

  _connect_cb: Union[callable, None]
  _disconnect_cb: Union[callable, None]
  _receive_cb: Union[callable, None]

  def __init__(self, host: str, token: str):
    self.host = host
    self.token = token

    self._socket = socketio.Client()

    self._connect_cb = None
    self._disconnect_cb = None
    self._receive_cb = None

    for ev in ["connect", "disconnect", "update-value"]:
      self._socket.on(ev, self._on_event(ev))

  def _on_event(self, event_name):
    handler = None

    if event_name == "connect":
      def handler():
        if self._connect_cb:
          self._connect_cb()
    elif event_name == "disconnect":
      def handler():
        if self._disconnect_cb:
          self._disconnect_cb()
    elif event_name == "update-value":
      def handler(data):
        if self._receive_cb:
          self._receive_cb(data["customId"], data["value"])

    return handler

  def connect(self):
    self._socket.connect(
      self.host,
      auth={
        "as": "device",
        "token": self.token
      }
    )

  @property
  def connected(self):
    return self._socket.connected

  def _attach(self, event_name, func):
    if event_name == "connect":
      self._connect_cb = func
    elif event_name == "disconnect":
      self._disconnect_cb = func
    elif event_name == "receive":
      self._receive_cb = func
    else:
      raise Exception("Unknown event:", event_name)

    return func

  def event(self, arg):
    if callable(arg):
      event_name = arg.__name__
      return self._attach(event_name, arg)
    else:
      def wrapper(cb):
        return self._attach(arg, cb)

      return wrapper

  def update(self, custom_id: str, value: Union[str, bool, int]):
    self._socket.emit("update-value", {
      "customId": custom_id,
      "value": value
    })

