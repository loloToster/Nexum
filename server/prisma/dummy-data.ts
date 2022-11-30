import { PrismaClient, User, Widget, WidgetProperties } from "@prisma/client"

async function main() {
  const prisma = new PrismaClient({ log: ["info", "warn", "error"] })

  // clear all tables
  await prisma.user.deleteMany()
  await prisma.widgetProperties.deleteMany()
  await prisma.widget.deleteMany()
  await prisma.tab.deleteMany()
  await prisma.device.deleteMany()

  const users: (Omit<User, "id"> & { id?: string })[] = [
    { id: "testid", name: "admin", isAdmin: true },
    { name: "x.tester", isAdmin: false },
    { name: "y.tester", isAdmin: false }
  ]

  for (const user of users) {
    await prisma.user.create({
      data: user
    })
  }

  const createdUsers = await prisma.user.findMany()

  const devices = ["arduino1", "esp2"]

  for (const deviceName of devices) {
    await prisma.device.create({
      data: { name: deviceName }
    })
  }

  const createdDevices = await prisma.device.findMany()

  interface W extends Omit<Widget, "id" | "tabId"> {
    properties?: Partial<WidgetProperties>
  }

  const tabs: Array<{
    name: string
    widgets: W[]
  }> = [
    {
      name: "tab 1",
      widgets: [
        {
          customId: "button",
          x: 0,
          y: 0,
          width: 2,
          height: 2,
          type: "btn",
          deviceId: createdDevices[0].id,
          properties: { isSwitch: true, text: "Button" }
        },
        {
          customId: "slider",
          x: 3,
          y: 0,
          width: 5,
          height: 2,
          type: "sldr",
          deviceId: createdDevices[0].id,
          properties: {
            color: "lime",
            step: 0.1,
            min: 0,
            max: 10,
            isVertical: false
          }
        },
        {
          customId: "slider",
          x: 2,
          y: 0,
          width: 1,
          height: 2,
          type: "lbl",
          deviceId: createdDevices[0].id,
          properties: {
            color: "pink",
            text: "/val/°C",
            step: 0.2
          }
        },
        {
          customId: "slider",
          x: 0,
          y: 3,
          width: 8,
          height: 6,
          type: "gauge",
          deviceId: createdDevices[0].id,
          properties: {
            color: "crimson",
            text: "/val/°C",
            step: 0.5
          }
        }
      ]
    },
    {
      name: "tab 2",
      widgets: [
        {
          customId: "idk",
          x: 1,
          y: 1,
          width: 4,
          height: 2,
          type: "unknwn",
          deviceId: createdDevices[1].id
        }
      ]
    }
  ]

  for (const tab of tabs) {
    await prisma.tab.create({
      data: {
        name: tab.name,
        widgets: {
          create: tab.widgets.map(w => ({
            ...w,
            properties: w.properties ? { create: w.properties } : undefined
          }))
        }
      }
    })
  }

  const createdTabs = await prisma.tab.findMany()

  for (const user of createdUsers) {
    const tabsIds = createdTabs.map(t => ({ id: t.id }))

    await prisma.user.update({
      data: { tabs: { connect: user.isAdmin ? tabsIds : tabsIds[1] } },
      where: { id: user.id }
    })
  }
}

main()
