import * as crypto from "crypto";

/**
 * Hashes a password using Node.js built-in crypto module
 * @param password The plain text password to hash
 * @param saltRounds Not used directly but kept for API compatibility with bcrypt
 * @returns A promise that resolves to the hashed password string
 */
export async function hashPassword(
	password: string,
	saltRounds = 10,
): Promise<string> {
	// Generate a random salt
	const salt = crypto.randomBytes(16).toString("hex");

	// Hash with scrypt (N=16384, r=8, p=1, keylen=64)
	return new Promise((resolve, reject) => {
		crypto.scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) reject(err);
			// Format: salt:hash
			resolve(`${salt}:${derivedKey.toString("hex")}`);
		});
	});
}

/**
 * Compares a password against a hash
 * @param password The plain text password to check
 * @param hash The stored hash to compare against
 * @returns A promise that resolves to a boolean indicating if the password matches
 */
export async function comparePassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const [salt, key] = hash.split(":");
		crypto.scrypt(password, salt, 64, (err, derivedKey) => {
			if (err) reject(err);
			resolve(key === derivedKey.toString("hex"));
		});
	});
}
