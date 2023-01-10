const { NexumClient } = require("..")

const client = new NexumClient({
  host: "http://localhost:3000",
  token: "token"
})

client.on("connect", () => {
  console.log("connected")
})

client.on("disconnect", () => {
  console.log("disconnected")
})

client.on("receive", console.log)

let i = 0
setInterval(() => {
  client.update("slider", i)
  i = i > 10 ? 0 : i + 0.2
}, 1000)
