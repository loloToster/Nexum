#include "nexum.h"

struct URL {
  String protocol;
  String host;
  int port;
  String path;
};

URL parseUrl(String url) {
  URL parsedUrl;

  parsedUrl.protocol = "http";
  parsedUrl.host = "";
  parsedUrl.port = 0;
  parsedUrl.path = "/";

  int idxOfProtoSeparator = url.indexOf("://");

  if (idxOfProtoSeparator > -1) {
    parsedUrl.protocol = url.substring(0, idxOfProtoSeparator);
    url = url.substring(idxOfProtoSeparator + 3);
  }

  int idxOfPathSeparator = url.indexOf("/");

  if (idxOfPathSeparator > -1) {
    parsedUrl.path = url.substring(idxOfPathSeparator);
    url = url.substring(0, idxOfPathSeparator);
  }

  int idxOfPortSeparator = url.indexOf(":");

  if (idxOfPortSeparator > -1) {
    parsedUrl.host = url.substring(0, idxOfPortSeparator);
    parsedUrl.port = url.substring(idxOfPortSeparator + 1).toInt();
  } else {
    parsedUrl.host = url;
  }

  return parsedUrl;
}

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

NexumClass::NexumClass()
    : _onConnect(NULL),
      _onDisconnect(NULL),
      _onSync(NULL),
      _onReceive(NULL),
      _connected(false) {}

void NexumClass::begin(const char *token, const char *ssid, const char *pass,
                       const char *host, uint16_t port, boolean useSSL) {
  if (WiFi.getMode() & WIFI_AP) {
    WiFi.softAPdisconnect(true);
  }

  WiFiMulti.addAP(ssid, pass);
  WiFiMulti.run();

  String path = "/socket.io/?EIO=4&v=2&as=device&token=" + String(token);

  if (useSSL) {
    socketIO.beginSSL(host, port, path);
  } else {
    socketIO.begin(host, port, path);
  }

  attachCb();
}

void NexumClass::begin(const char *token, const char *ssid, const char *pass,
                       const char *url) {
  URL parsedUrl = parseUrl(url);

  boolean useSSL = parsedUrl.protocol == "https" || parsedUrl.protocol == "wss";

  if (!parsedUrl.port) {
    parsedUrl.port = useSSL ? 443 : 80;
  }

  begin(token, ssid, pass, parsedUrl.host.c_str(), parsedUrl.port, useSSL);
}

void NexumClass::attachCb() {
  socketIO.onEvent(
      [this](socketIOmessageType_t type, uint8_t *payload, size_t length) {
        switch (type) {
          case sIOtype_DISCONNECT: {
            if (!_connected) break;
            _connected = false;
            if (_onDisconnect) _onDisconnect();
            break;
          }

          case sIOtype_CONNECT: {
            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");

            if (_connected) break;
            _connected = true;
            if (_onConnect) _onConnect();
            break;
          }

          case sIOtype_EVENT: {
            StaticJsonDocument<1024> doc;
            DeserializationError error = deserializeJson(doc, payload);

            if (error) break;

            String event = doc[0];
            auto data = doc[1];

            if (event == "sync") {
              if (!_onSync) break;

              for (int i = 0; true; i++) {
                boolean exists = data[i]["customId"];

                if (!exists) break;

                String customId = data[i]["customId"];
                String value = data[i]["value"];

                _onSync(customId, value);
              }
            } else if (event == "update-value") {
              if (!_onReceive) break;

              String customId = data["customId"];
              // TODO: dynamic type
              String value = data["value"];

              _onReceive(customId, value);
            }

            break;
          }
        }
      });
}

void NexumClass::onConnect(void (*callback)()) { _onConnect = callback; }

void NexumClass::onDisconnect(void (*callback)()) { _onDisconnect = callback; }

void NexumClass::onSync(void (*callback)(String, String)) {
  _onSync = callback;
}

void NexumClass::onReceive(void (*callback)(String, String),
                           boolean attachToSync /* = false */) {
  _onReceive = callback;
  if (attachToSync) _onSync = callback;
}

void NexumClass::rawUpdate(String customId, String value) {
  String payload = "[\"update-value\", { \"customId\": \"" + customId +
                   "\", \"value\": " + value + " }]";

  socketIO.send(sIOtype_EVENT, payload);
}

void NexumClass::update(String customId, String value) {
  rawUpdate(customId, "\"" + value + "\"");
}

void NexumClass::update(String customId, const char *value) {
  update(customId, (String)value);
}

void NexumClass::update(String customId, int value) {
  rawUpdate(customId, String(value));
}

void NexumClass::update(String customId, double value) {
  rawUpdate(customId, String(value));
}

void NexumClass::update(String customId, boolean value) {
  rawUpdate(customId, value ? "true" : "false");
}

boolean NexumClass::isConnected() { return _connected; }

void NexumClass::loop() { socketIO.loop(); }

NexumClass Nexum;
