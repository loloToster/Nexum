import { Controller, Get, UseGuards } from "@nestjs/common"

import { IsAdminGuard } from "src/guards/isadmin.guard"

import { TabService } from "./tab.service"

@Controller("/api/tabs")
export class TabController {
  constructor(private tabService: TabService) {}

  @Get("/")
  @UseGuards(IsAdminGuard)
  async getAll() {
    return this.tabService.getTabs()
  }
}
