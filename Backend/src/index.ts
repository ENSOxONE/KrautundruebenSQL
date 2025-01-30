import { generateRandomHex } from "./utils/randomString";
import express, { Request, Response } from "express";
import { sha512 } from "./utils/hashing";
import { query } from "./utils/db";
import multer from 'multer';
import path from "path";
import { User, Recepie, Ingredient } from "./types";
import { getHeader, getHtmlFile } from "./utils/html";

const upload = multer();
const app = express();
const port = 8080;

app.post("/hash", async(request: Request, response: Response) => {
	response.status(200).json({
		response: sha512(request.body.input)
	})
})

app.use(express.static(path.join(__dirname, "www", "public")));
app.use(express.urlencoded({ extended: true }));

app.post("/login", async(request: Request, response: Response) => {
	console.log(request.body);
	const user = (await query(`select * from KUNDE where EMAIL = ?`, [request.body.email]) as User[])[0];
	if (!user) {
		response.status(404).redirect("/loginerror.html?errormessage=User not found.")
		return;
	}
	if (user.PASSWORDHASH == sha512(request.body.password)) {
		const sessionToken = generateRandomHex();
		query(`update KUNDE set SESSIONTOKEN = ? where KUNDENNR = ?`, [sessionToken, user.KUNDENNR]);
		response.cookie("auth", sessionToken).status(200).json({
			success: true
		});
		return;
	} else {
		response.status(403).redirect("/loginerror.html?errormessage=Invalid Password.")
		return;
	}
})

app.get("/recepies", async(_: Request, response: Response) => {
	response.json(await query("select * from REZEPTE"));
})

app.get("/ingredients", async(_: Request, response: Response) => {
	response.json(await query("select * from ZUTAT"));
})

app.post("/ingredients", async(request: Request, response: Response) => {
	if (!request.body.recepieId) {
		response.status(400).json({
			success: false,
			errors: [
				"Missing recepieId parameter."
			]
		})
		return;
	}

	const recepie = (await query("select * from REZEPTE where REZEPTNR = ?", [request.body.recepieId]) as Recepie[])[0];
	if (!recepie) {
		response.status(404).json({
			success: false,
			errors: [
				"Recepie not found."
			]
		})
		return;
	}
	const ingredients = await query("select * from REZEPTZUTATEN where REZEPTNR = ?", [recepie.REZEPTNR]) as Ingredient[];
	response.json(ingredients);
})

app.get("/", (request: Request, response: Response) => {
	console.log(request.cookies);
	const loggedIn = false;
	response.send(`${getHeader(loggedIn)}
	
	<div class="container mt-5">
		<h1>Willkommen bei Kraut & Rüben</h1>
		<p>Entdecken Sie unsere leckeren Rezepte und Zutaten!</p>
	</div>

	${getHtmlFile("footer.html")}`)
})

app.listen(port, () => {
	console.log(`Serving on http://localhost:${port}`);
})
