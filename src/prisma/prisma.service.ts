import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from 'generated/prisma/client' // adjust if path different

// Import the adapter + driver
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg' // or import { Client } from 'pg' if you prefer single connection

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        // Create a connection pool (recommended for NestJS / production)
        const connectionString = process.env.DATABASE_URL

        if (!connectionString) {
            throw new Error('DATABASE_URL is not set in environment variables')
        }

        const pool = new Pool({ connectionString })

        const adapter = new PrismaPg(pool)

        // Pass the adapter to PrismaClient
        super({
            adapter,
            // Optional: add logging in dev
            log:
                process.env.NODE_ENV === 'development'
                    ? ['query', 'info', 'warn', 'error']
                    : ['error'],
        })
    }

    async onModuleInit() {
        await this.$connect()
    }

    // Optional: cleanup on shutdown
    async onModuleDestroy() {
        await this.$disconnect()
    }
}
