import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';

@Controller('platform-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlatformSettingsController {
  constructor(
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  @Get()
  @Roles(RoleEnum.ADMIN)
  getSettings() {
    return this.platformSettingsService.getSettings();
  }

  @Put()
  @Roles(RoleEnum.ADMIN)
  updateSettings(@Body() updatePlatformSettingDto: UpdatePlatformSettingDto) {
    return this.platformSettingsService.updateSettings(
      updatePlatformSettingDto,
    );
  }
}
