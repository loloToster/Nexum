const { NexumClient } = require("..")

const client = new NexumClient({
  host: "http://localhost:3000",
  token: "token"
})

client.onConnect(() => {
  console.log("connected")
})

client.onDisconnect(() => {
  console.log("disconnected")
})

client.onReceive(console.log)

let i = 0
setInterval(() => {
  client.update("slider", i)
  i += 0.2
}, 1000)
