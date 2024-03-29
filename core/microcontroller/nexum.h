#ifndef nexum_h
#define nexum_h

#include <Arduino.h>
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <Hash.h>
#include <SocketIOclient.h>
#include <WebSocketsClient.h>

class NexumClass {
 public:
  NexumClass();

  void begin(const char *token, const char *ssid, const char *pass,
             const char *host, uint16_t port, boolean useSSL);
  void begin(const char *token, const char *ssid, const char *pass,
             const char *url);

  void onConnect(void (*callback)());
  void onDisconnect(void (*callback)());
  void onSync(void (*callback)(String, String));
  void onReceive(void (*callback)(String, String),
                 boolean attachToSync = false);

  void update(String customId, String value);
  void update(String customId, const char *value);
  void update(String customId, int value);
  void update(String customId, double value);
  void update(String customId, boolean value);

  boolean isConnected();
  boolean isWifiConnected();

  void loop();

 private:
  boolean _connected;
  void (*_onConnect)();
  void (*_onDisconnect)();
  void (*_onSync)(String, String);
  void (*_onReceive)(String, String);

  void attachCb();
  void rawUpdate(String customId, String value);
};

extern NexumClass Nexum;

#endif
