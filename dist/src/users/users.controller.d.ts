import { UsersService } from './users.service';
import { UpdateUserDto, UserListQueryDto } from './dto/user.dto';
import { User } from './schemas/user.schema';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(query: UserListQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/user.schema").UserDocument, {}, {}> & User & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: string & import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto, req: Request & {
        user: {
            userId: string;
        };
    }): Promise<User>;
}
