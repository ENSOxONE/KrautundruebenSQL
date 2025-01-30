import { createHash } from "crypto";

export function sha512(input: string) {
    return createHash("sha512").update(input).digest("hex");
}
