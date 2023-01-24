import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common"

import { User } from "src/decorators/user.decorator"
import { User as UserI } from "@prisma/client"
import { IsAdminGuard } from "src/guards/isadmin.guard"

import { TabService } from "./tab.service"

import CreateTabDto from "src/dtos/createTab.dto"

@Controller("/api/tabs")
export class TabController {
  constructor(private tabService: TabService) {}

  @Get("/")
  @UseGuards(IsAdminGuard)
  async getAll() {
    return this.tabService.getTabs()
  }

  @Post("/")
  @UseGuards(IsAdminGuard)
  async createTab(@Body() newTab: CreateTabDto, @User() creator: UserI) {
    return this.tabService.createTab(newTab.name, creator.id)
  }
}
