import { User } from "../types";
import { query } from "./db";

export async function validateAuthToken(authToken: string): Promise<boolean> {
    return ((await query("SELECT * FROM KUNDE WHERE SESSIONTOKEN = ?", [authToken]) as User[]).length > 0);
}
