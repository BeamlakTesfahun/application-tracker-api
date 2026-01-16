"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrismaClientClass = getPrismaClientClass;
const runtime = require("@prisma/client/runtime/client");
const config = {
    "previewFeatures": [],
    "clientVersion": "7.2.0",
    "engineVersion": "0c8ef2ce45c83248ab3df073180d5eda9e8be7a3",
    "activeProvider": "postgresql",
    "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\nmodel User {\n  id           String   @id @default(cuid())\n  email        String   @unique\n  firstName    String\n  lastName     String\n  passwordHash String\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  refreshTokens RefreshToken[]\n}\n\nmodel RefreshToken {\n  id        String    @id @default(cuid())\n  tokenHash String    @unique\n  userId    String\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  expiresAt DateTime\n  revokedAt DateTime?\n  createdAt DateTime  @default(now())\n\n  @@index([userId])\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"firstName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"passwordHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"refreshTokens\",\"kind\":\"object\",\"type\":\"RefreshToken\",\"relationName\":\"RefreshTokenToUser\"}],\"dbName\":null},\"RefreshToken\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tokenHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"RefreshTokenToUser\"},{\"name\":\"expiresAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"revokedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}");
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await Promise.resolve().then(() => require('node:buffer'));
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async () => await Promise.resolve().then(() => require("@prisma/client/runtime/query_compiler_bg.postgresql.js")),
    getQueryCompilerWasmModule: async () => {
        const { wasm } = await Promise.resolve().then(() => require("@prisma/client/runtime/query_compiler_bg.postgresql.wasm-base64.js"));
        return await decodeBase64AsWasm(wasm);
    }
};
function getPrismaClientClass() {
    return runtime.getPrismaClient(config);
}
//# sourceMappingURL=class.js.map