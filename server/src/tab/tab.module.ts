import { Module } from "@nestjs/common"

import { TabController } from "./tab.controller"
import { TabService } from "./tab.service"

@Module({
  controllers: [TabController],
  providers: [TabService]
})
export class TabModule {}
