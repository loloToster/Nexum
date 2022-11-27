#include "nexum.h"

NexumClass::NexumClass()
    : _onConnect(NULL),
      _onDisconnect(NULL),
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
            Serial.printf("[IOc] get event: %s %u\n", payload, length);
            break;
          }
        }
      });
}

void NexumClass::onConnect(void (*callback)()) { _onConnect = callback; }

void NexumClass::onDisconnect(void (*callback)()) { _onDisconnect = callback; }

void NexumClass::loop() { socketIO->loop(); }

NexumClass Nexum;
