import nexum

client = nexum.Client(host="http://localhost:3000", token="token")

@client.event
def connect():
  print("connected!")

@client.event("disconnect")
def on_disconnect():
  print("disconnected!")

@client.event
def receive(custom_id, value):
  print(custom_id, value)

  if custom_id == "button":
    client.update("button", not value)


client.connect()
