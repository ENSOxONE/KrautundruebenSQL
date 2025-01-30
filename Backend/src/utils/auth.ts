import { User } from "../types";

export function validateAuthToken(authToken: string, user: User) {
    return authToken == user.SESSIONTOKEN;
}
