import nexum

client = nexum.Client(host="http://localhost:3000", token="token")

@client.on
def connect():
  print("connected!")

@client.on("disconnect")
def on_disconnect():
  print("disconnected!")

@client.on("receive")
def receive(custom_id, value):
  print(custom_id, value)

  if custom_id == "button":
    client.update("button", not value)

@client.on("sync")
def sync(data):
  print("sync:", data)


client.connect()
