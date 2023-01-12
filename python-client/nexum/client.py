import socketio

import urllib.parse as urlparse
from urllib.parse import urlencode
from typing import Union

from .EventEmitter import EventEmitter


class Client(EventEmitter):
  host: str
  token: str

  _socket: socketio.Client

  def __init__(self, host: str, token: str):
    super().__init__()

    self.host = host
    self.token = token

    self._socket = socketio.Client()

    self._socket.on("connect", lambda: self.emit("connect"))
    self._socket.on("disconnect", lambda: self.emit("disconnect"))
    self._socket.on("sync", lambda d: self.emit("sync", d))
    self._socket.on("update-value", lambda d: self.emit("receive", d["customId"], d["value"]))

  def connect(self):
    url = self.host

    url_parts = list(urlparse.urlparse(url))
    query = dict(urlparse.parse_qsl(url_parts[4]))
    query.update({"v": "2"})
    url_parts[4] = urlencode(query)

    self._socket.connect(
      urlparse.urlunparse(url_parts),
      auth={
        "as": "device",
        "token": self.token
      }
    )

  @property
  def connected(self):
    return self._socket.connected

  def update(self, custom_id: str, value: Union[str, bool, int]):
    self._socket.emit("update-value", {
      "customId": custom_id,
      "value": value
    })
