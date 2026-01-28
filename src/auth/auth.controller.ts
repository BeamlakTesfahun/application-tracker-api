import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtAuthGuard } from './jwt/jwt-auth.guard' // adjust path if yours differs
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'

@Controller('auth')
export class AuthController {
    constructor(
        private readonly auth: AuthService,
        private readonly config: ConfigService,
    ) {}

    @Throttle({ default: { ttl: 60, limit: 3 } })
    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const user = await this.auth.register(
            dto.email,
            dto.password,
            dto.firstName,
            dto.lastName,
        )
        return { user }
    }

    @Throttle({ default: { ttl: 10, limit: 2 } })
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response, // modify the response object
    ) {
        const result = await this.auth.login(dto.email, dto.password)

        // set HttpOnly refresh cookie
        res.cookie(
            this.auth.getRefreshCookieName(),
            result.refreshToken,
            this.cookieOptions(),
        )

        // return access token + user
        return { user: result.user, accessToken: result.tokens.accessToken }
    }

    @Throttle({ default: { ttl: 60, limit: 10 } })
    @Post('refresh')
    async refresh(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const cookieName = this.auth.getRefreshCookieName()
        const refreshToken = req.cookies?.[cookieName]

        if (!refreshToken) return { accessToken: null }

        // verify refresh token signature -> get user id
        const payload = await this.auth.verifyRefreshToken(refreshToken)

        // rotate refresh token and return new access token
        const rotated = await this.auth.refresh(payload.sub, refreshToken)

        // update cookie with new refresh token
        res.cookie(cookieName, rotated.refreshToken, this.cookieOptions())

        return { accessToken: rotated.accessToken }
    }

    @Post('logout')
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const cookieName = this.auth.getRefreshCookieName()
        const refreshToken = req.cookies?.[cookieName]

        // Best-effort revoke (if token valid)
        if (refreshToken) {
            try {
                const payload = await this.auth.verifyRefreshToken(refreshToken)
                await this.auth.logout(payload.sub)
            } catch {
                // ignore invalid token
            }
        }

        res.clearCookie(cookieName, this.cookieOptions())
        return { success: true }
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() req: any) {
        return { user: req.user } // { userId, email } from JwtStrategy.validate
    }

    private cookieOptions() {
        const days = Number(
            this.config.get<string>('REFRESH_COOKIE_DAYS') ?? '7',
        )
        const secure =
            (this.config.get<string>('COOKIE_SECURE') ?? 'false') === 'true'

        return {
            httpOnly: true,
            secure,
            sameSite: 'lax' as const,
            path: '/auth/refresh',
            maxAge: days * 24 * 60 * 60 * 1000,
        }
    }
}
