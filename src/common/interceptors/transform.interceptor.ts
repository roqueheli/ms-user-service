import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
    data: T;
    statusCode: number;
    message: string;
    timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const path = request.url;

        // Excluir rutas específicas
        if (path === '/api/users/login') {
            return next.handle(); // Devuelve la respuesta sin modificar
        }

        return next.handle().pipe(
            map((data) => ({
                data,
                statusCode: context.switchToHttp().getResponse().statusCode,
                message: 'Success',
                timestamp: new Date().toISOString(),
            })),
        );
    }
}