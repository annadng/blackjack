import { createHash, randomBytes, pbkdf2Sync } from "crypto";

export function hashPassword(password: string): { hash: string; salt: string } {
    const salt = randomBytes(16).toString("hex");
    const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return { hash, salt };
}

export function verifyPassword(
    password: string,
    hash: string,
    salt: string
): boolean {
    const hashToVerify = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === hashToVerify;
}
