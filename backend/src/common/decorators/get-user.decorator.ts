import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // Si se pide un campo específico (data = 'sub'), devuelve user.sub
        return data ? user?.[data] : user;
    },
);