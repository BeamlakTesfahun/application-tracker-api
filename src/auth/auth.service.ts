import {
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'

type Tokens = { accessToken: string }

@Injectable()
export class AuthService {
    private refreshCookieName: string
    private refreshCookieDays: number

    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) {
        this.refreshCookieName =
            this.config.get<string>('REFRESH_COOKIE_NAME') ?? 'refresh_token'
        this.refreshCookieDays = Number(
            this.config.get<string>('REFRESH_COOKIE_DAYS') ?? '7',
        )
    }

    getRefreshCookieName() {
        return this.refreshCookieName
    }

    async register(
        email: string,
        password: string,
        firstName: string,
        lastName: string,
    ) {
        const existing = await this.prisma.user.findUnique({ where: { email } })
        if (existing) throw new ForbiddenException('Email already in use')

        const passwordHash = await bcrypt.hash(password, 12)
        const user = await this.prisma.user.create({
            data: { email, firstName, lastName, passwordHash },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
            },
        })
        return user
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } })
        if (!user) throw new UnauthorizedException('Invalid credentials')

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) throw new UnauthorizedException('Invalid credentials')

        const { accessToken, refreshToken } = await this.issueTokens(
            user.id,
            user.email,
        )

        await this.storeRefreshTokenHash(user.id, refreshToken)

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            tokens: { accessToken },
            refreshToken, // controller will set cookie and not return it
        }
    }

    async refresh(userId: string, refreshToken: string) {
        const tokens = await this.prisma.refreshToken.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
            take: 10,
        })

        let matched: { id: string } | null = null
        for (const t of tokens) {
            const ok = await bcrypt.compare(refreshToken, t.tokenHash)
            if (ok) {
                matched = { id: t.id }
                break
            }
        }
        if (!matched) throw new UnauthorizedException('Invalid refresh token')

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        })
        if (!user) throw new UnauthorizedException('User not found')

        // rotate: revoke matched token, issue new
        await this.prisma.refreshToken.update({
            where: { id: matched.id },
            data: { revokedAt: new Date() },
        })

        const { accessToken, refreshToken: newRefresh } =
            await this.issueTokens(user.id, user.email)
        await this.storeRefreshTokenHash(user.id, newRefresh)

        return { accessToken, refreshToken: newRefresh }
    }

    async logout(userId: string) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        })
    }

    async verifyRefreshToken(refreshToken: string) {
        try {
            const payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
            })
            return payload as { sub: string; email: string }
        } catch {
            throw new UnauthorizedException('Invalid refresh token')
        }
    }

    private async issueTokens(userId: string, email: string) {
        const accessExpires =
            this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m'
        const refreshExpires =
            this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d'

        const accessToken = await this.jwt.signAsync(
            { sub: userId, email },
            {
                secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
                expiresIn: accessExpires as any,
            },
        )

        const refreshToken = await this.jwt.signAsync(
            { sub: userId, email },
            {
                secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
                expiresIn: refreshExpires as any,
            },
        )

        return { accessToken, refreshToken }
    }

    private async storeRefreshTokenHash(userId: string, refreshToken: string) {
        const tokenHash = await bcrypt.hash(refreshToken, 12)

        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + this.refreshCookieDays)

        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        })
    }
}
