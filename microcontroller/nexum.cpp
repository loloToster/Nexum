#include "nexum.h"

ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;

NexumClass::NexumClass()
    : _onConnect(NULL),
      _onDisconnect(NULL),
      _onReceive(NULL),
      _connected(false) {}

void NexumClass::begin(String token, const char *ssid, const char *pass,
                       const char *host, uint16_t port, boolean useSSL) {
  if (WiFi.getMode() & WIFI_AP) {
    WiFi.softAPdisconnect(true);
  }

  WiFiMulti.addAP(ssid, pass);
  WiFiMulti.run();

  if (useSSL) {
    socketIO.beginSSL(host, port, "/socket.io/?EIO=4&as=device&token=" + token);
  } else {
    socketIO.begin(host, port, "/socket.io/?EIO=4&as=device&token=" + token);
  }

  attachCb();
}

void NexumClass::begin(String token, const char *ssid, const char *pass,
                       const char *host, uint16_t port) {
  begin(token, ssid, pass, host, port, false);
}

void NexumClass::begin(String token, const char *ssid, const char *pass,
                       const char *host, boolean useSSL) {
  if (useSSL) {
    begin(token, ssid, pass, host, 443, useSSL);
  } else {
    begin(token, ssid, pass, host, 80, useSSL);
  }
}

void NexumClass::begin(String token, const char *ssid, const char *pass,
                       const char *host) {
  begin(token, ssid, pass, host, 80, false);
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
            if (!_onReceive) break;

            StaticJsonDocument<64> doc;
            DeserializationError error = deserializeJson(doc, payload);

            if (error || doc[0] != "update-value") {
              break;
            }

            String customId = doc[1]["customId"];
            // TODO: dynamic type
            String value = doc[1]["value"];

            _onReceive(customId, value);

            break;
          }
        }
      });
}

void NexumClass::onConnect(void (*callback)()) { _onConnect = callback; }

void NexumClass::onDisconnect(void (*callback)()) { _onDisconnect = callback; }

void NexumClass::onReceive(void (*callback)(String, String)) {
  _onReceive = callback;
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
