import { Body, Controller, Get, Param, Patch, Req, UploadedFile } from "@nestjs/common";
import { UpdateCourseProviderInfoDto } from "./dto/update-course-provider-info.dto";
import { ChangePasswordDto } from "../users/dto/change-password.dto";
import { UsersService } from "../users/users.service";
import { UpdateCourseProviderProfileDto } from "./dto/update-course-provider-profile.dto";
import { GetCourseProviderProfileDto } from "./dto/get-course-provider-profile.dto";
import { CourseProviderService } from "./course-providers.service";

@Controller('course-providers')
export class CourseProviderController {
    constructor(
        private userService:UsersService,
        private cpService:CourseProviderService,
    ) {}

    @Patch('update-profile/:id')
    async updateProfile(@Param('id') id:number, @Body() dto: UpdateCourseProviderInfoDto){
        return this.cpService.updateProfile(id, dto);
    }

    @Patch('change-password')
    async changePassword(@Req() req, dto: ChangePasswordDto){
        return this.userService.changePassword(req.user.id, dto);
    }

    @Patch('edit-profile/:id')
    async editCourseProviderProfile(@Param('id') id: number, @Body() dto:UpdateCourseProviderProfileDto, @UploadedFile() file?: Express.Multer.File,){
        return this.cpService.editCourseProviderProfile(id, dto, file);
    }

    @Get(':id')
    async viewCourseProviderProfile(@Param('id') id: number, dto: GetCourseProviderProfileDto){
        return this.cpService.viewCourseProviderProfile(id, dto);
    }
}