import { Body, Controller, Get, Post, Put, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { UpdatePlatformSettingDto } from './dto/update-platform-setting.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlatformSetting } from './entities/platform-setting.entity';
import { CreatePlatformSettingDto } from './dto/create-platform-setting.dto';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Platform settings')
@ApiBearerAuth()
@Controller('platform-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlatformSettingsController {
  constructor(
    private readonly platformSettingsService: PlatformSettingsService,
  ) {}

  @Post()
  @Roles(RoleEnum.ADMIN)
  @UseInterceptors(FileFieldsInterceptor([
    {name: 'logoUrl', maxCount:1 },
    {name: 'bannerUrl', maxCount:1 },
  ]))
  createSetting(@Body() dto:CreatePlatformSettingDto, @UploadedFiles() files?:{
    logoUrl?: Express.Multer.File[];
    bannerUrl?: Express.Multer.File[];
  })
  {
    return this.platformSettingsService.createSetting(dto, files);
  }

  @ApiOperation({ summary: 'Check if platform settings are configured' })
  @ApiResponse({ status: 200, description: 'Return platform settings configuration status.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @Get('status')
  @Roles(RoleEnum.ADMIN)
  async getStatus() {
    const configured = await this.platformSettingsService.isConfigured();
    return { configured };
  }

  @ApiOperation({ summary: 'Get platform settings' })
  @ApiResponse({ status: 200, description: 'Return the platform settings.', type: PlatformSetting })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @ApiResponse({ status: 404, description: 'Platform setting not found' })
  @Get()
  @Roles(RoleEnum.ADMIN)
  getSettings() {
    return this.platformSettingsService.getSettings();
  }

  @ApiOperation({ summary: 'Update platform settings' })
  @ApiBody({ type: UpdatePlatformSettingDto })
  @ApiResponse({ status: 200, description: 'Platform settings have been successfully updated.', type: PlatformSetting })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only)' })
  @Put()
  @Roles(RoleEnum.ADMIN)
  updateSettings(@Body() updatePlatformSettingDto: UpdatePlatformSettingDto) {
    return this.platformSettingsService.updateSettings(
      updatePlatformSettingDto,
    );
  }
}
