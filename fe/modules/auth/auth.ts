export interface Credentials {
	email: string;
	password: string;
}

export interface User {
	id: string;
	email: string;
}

export interface AuthTokens {
	access_token: string;
}

export interface AuthResponse extends AuthTokens {
	user?: User;
}
