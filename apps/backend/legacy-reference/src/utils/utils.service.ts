import { User } from '@erp/db/client';
import { UserResponse } from '@erp/shared';
import { Injectable } from '@nestjs/common';
import omit from 'lodash/omit';

@Injectable()
export class UtilsService {
    public getUserResponse(user: User): UserResponse {
        return omit(user, ['password']);
    }
}
