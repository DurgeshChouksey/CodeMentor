import crypto from "crypto";

const ALGO = "aes-256-cbc";

// MUST be 32 bytes key
const SECRET_KEY = Buffer.from(
    process.env.CRYPTO_SECRET_KEY || "0123456789abcdef0123456789abcdef",
    "utf8"
);

/**
 * Encrypt text → return "ivHex:encryptedHex"
 */
export const encrypt = (plainText: string): string => {
    const iv = crypto.randomBytes(16); // 16 bytes IV required for AES-256-CBC
    const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);

    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");

    return `${iv.toString("hex")}:${encrypted}`;
};

/**
 * Decrypt "ivHex:encryptedHex"
 */
export const decrypt = (encryptedText: string): string => {
    const parts = encryptedText.split(":");

    if (parts.length !== 2) {
        throw new Error("Invalid encrypted text format");
    }

    const [ivHex, encryptedHex] = parts as [string, string];

    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv(ALGO, SECRET_KEY, iv);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
};
