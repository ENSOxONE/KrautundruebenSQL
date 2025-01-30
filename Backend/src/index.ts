import express, { Request, Response } from "express";
import { sha512 } from "./utils/hashing";
import { query } from "./utils/db";
import multer from 'multer';
import { generateRandomHex } from "./utils/randomString";

const upload = multer();
const app = express();
const port = 8080;

app.post("/hash", upload.none(), async(request: Request, response: Response) => {
    response.status(200).json({
        response: sha512(request.body.input)
    })
})

type User = {
    KUNDENNR: number,
    NACHNAME: string,
    VORNAME: string,
    GEBURTSDATUM: Date,
    STRASSE: string,
    HAUSNR: string,
    PLZ: string,
    ORT: string,
    TELEFON: string,
    EMAIL: string,
    PASSWORDHASH: string
}

app.post("/login", upload.none(), async(request: Request, response: Response) => {
    const user = (await query(`select * from KUNDE where EMAIL = ?`, [request.body.email]) as User[])[0];
    if (!user) {
        response.status(404).json({
            success: false,
            errors: [
                "User not found."
            ]
        })
    }
    if (user.PASSWORDHASH == sha512(request.body.password)) {
        const sessionToken = generateRandomHex();
        query(`update KUNDE set SESSIONTOKEN = ? where KUNDENNR = ?`, [sessionToken, user.KUNDENNR])
        response.cookie("auth", sessionToken).status(200).json({
            "success": true
        })
    } else {
        response.status(403).json({
            success: false,
            errors: [
                "Invalid password."
            ]
        })
    }
    response.status(500).json({
        success: false,
        errors: [
            "Idk wtf u did but u broke it"
        ]
    });
})

app.get("/", async(request: Request, response: Response) => {
    console.log(await query("select * from KUNDE"));
    response.status(200).send("Hello, World!");
})

app.listen(port)
