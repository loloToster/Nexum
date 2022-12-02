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

  void begin(String token, const char *ssid, const char *pass,
             const char *host);

  void onConnect(void (*callback)());
  void onDisconnect(void (*callback)());
  void onReceive(void (*callback)(String, String));

  void loop();

 private:
  ESP8266WiFiMulti *WiFiMulti;
  SocketIOclient *socketIO;
  void (*_onConnect)();
  void (*_onDisconnect)();
  void (*_onReceive)(String, String);

  void attachCb();
};

extern NexumClass Nexum;

#endif
