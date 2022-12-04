#include "nexum.h"

NexumClass::NexumClass()
    : _onConnect(NULL),
      _onDisconnect(NULL),
      _onReceive(NULL),
      WiFiMulti(new ESP8266WiFiMulti()),
      socketIO(new SocketIOclient()) {}

void NexumClass::begin(String token, const char *ssid, const char *pass,
                       const char *host) {
  if (WiFi.getMode() & WIFI_AP) {
    WiFi.softAPdisconnect(true);
  }

  WiFiMulti->addAP(ssid, pass);

  while (WiFiMulti->run() != WL_CONNECTED) {
    delay(100);
  }

  socketIO->begin(host, 3000, "/socket.io/?EIO=4&as=device&token=" + token);
  attachCb();
}

void NexumClass::attachCb() {
  socketIO->onEvent(
      [this](socketIOmessageType_t type, uint8_t *payload, size_t length) {
        switch (type) {
          case sIOtype_DISCONNECT: {
            _onDisconnect();
            break;
          }

          case sIOtype_CONNECT: {
            _onConnect();
            // join default namespace (no auto join in Socket.IO V3)
            socketIO->send(sIOtype_CONNECT, "/");
            break;
          }

          case sIOtype_EVENT: {
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

void NexumClass::update(String customId, String value) {
  String payload = "[\"update-value\", { \"customId\": \"" + customId +
                   "\", \"value\": \"" + value + "\" }]";
  socketIO->send(sIOtype_EVENT, payload);
}

void NexumClass::loop() { socketIO->loop(); }

NexumClass Nexum;
