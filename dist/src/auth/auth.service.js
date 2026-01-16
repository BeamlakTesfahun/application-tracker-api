"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
        this.refreshCookieName =
            this.config.get('REFRESH_COOKIE_NAME') ?? 'refresh_token';
        this.refreshCookieDays = Number(this.config.get('REFRESH_COOKIE_DAYS') ?? '7');
    }
    getRefreshCookieName() {
        return this.refreshCookieName;
    }
    async register(email, password, firstName, lastName) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing)
            throw new common_1.ForbiddenException('Email already in use');
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: { email, firstName, lastName, passwordHash },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                createdAt: true,
            },
        });
        return user;
    }
    async login(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const { accessToken, refreshToken } = await this.issueTokens(user.id, user.email);
        await this.storeRefreshTokenHash(user.id, refreshToken);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
            tokens: { accessToken },
            refreshToken,
        };
    }
    async refresh(userId, refreshToken) {
        const tokens = await this.prisma.refreshToken.findMany({
            where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        let matched = null;
        for (const t of tokens) {
            const ok = await bcrypt.compare(refreshToken, t.tokenHash);
            if (ok) {
                matched = { id: t.id };
                break;
            }
        }
        if (!matched)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        await this.prisma.refreshToken.update({
            where: { id: matched.id },
            data: { revokedAt: new Date() },
        });
        const { accessToken, refreshToken: newRefresh } = await this.issueTokens(user.id, user.email);
        await this.storeRefreshTokenHash(user.id, newRefresh);
        return { accessToken, refreshToken: newRefresh };
    }
    async logout(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async verifyRefreshToken(refreshToken) {
        try {
            const payload = await this.jwt.verifyAsync(refreshToken, {
                secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            });
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async issueTokens(userId, email) {
        const accessExpires = this.config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m';
        const refreshExpires = this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '7d';
        const accessToken = await this.jwt.signAsync({ sub: userId, email }, {
            secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
            expiresIn: accessExpires,
        });
        const refreshToken = await this.jwt.signAsync({ sub: userId, email }, {
            secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
            expiresIn: refreshExpires,
        });
        return { accessToken, refreshToken };
    }
    async storeRefreshTokenHash(userId, refreshToken) {
        const tokenHash = await bcrypt.hash(refreshToken, 12);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.refreshCookieDays);
        await this.prisma.refreshToken.create({
            data: { userId, tokenHash, expiresAt },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map