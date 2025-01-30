import { generateRandomHex } from "./utils/randomString";
import { getHeader, getHtmlFile } from "./utils/html";
import express, { Request, Response } from "express";
import { User, Recepie, Ingredient, RecepieIngredient } from "./types";
import { sha512 } from "./utils/hashing";
import cookieParser from "cookie-parser";
import { query } from "./utils/db";
import multer from 'multer';
import path from "path";
import { validateAuthToken } from "./utils/auth";

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
app.use(cookieParser());

app.post("/login", async(request: Request, response: Response) => {
	console.log(request.body);
	const user = (await query(`SELECT * FROM KUNDE WHERE EMAIL = ?`, [request.body.email]) as User[])[0];
	if (!user) {
		response.status(404).redirect("/loginerror.html?errormessage=User not found.")
		return;
	}
	if (user.PASSWORDHASH == sha512(request.body.password)) {
		const sessionToken = generateRandomHex();
		query(`UPDATE KUNDE SET SESSIONTOKEN = ? WHERE KUNDENNR = ?`, [sessionToken, user.KUNDENNR]);
		response.cookie("auth", sessionToken).status(200).redirect("/");
		return;
	} else {
		response.status(403).redirect("/loginerror.html?errormessage=Invalid Password.")
		return;
	}
})

app.get("/loginerror", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	response.send(`${getHeader(loggedIn, "Login Fehler")}
	
	<div class="container mt-5">
		<h1>Fehler beim Login</h1>
		<p id="errormessage"></p>
	</div>

    <script>
        document.getElementById("errormessage").textContent = new URLSearchParams(window.location.search).get("errormessage");
    </script>
	
	${getHtmlFile("footer.html")}`);
})

app.get("/logout", (request: Request, response: Response) => {
	query("UPDATE KUNDE SET SESSIONTOKEN = NULL WHERE SESSIONTOKEN = ?", [request.cookies.auth]);
	response.cookie("auth", "").redirect("/");
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

	const recepie = (await query("SELECT * FROM REZEPTE WHERE REZEPTNR = ?", [request.body.recepieId]) as Recepie[])[0];
	if (!recepie) {
		response.status(404).json({
			success: false,
			errors: [
				"Recepie not found."
			]
		})
		return;
	}
	const ingredients = await query("SELECT * FROM REZEPTZUTATEN WHERE REZEPTNR = ?", [recepie.REZEPTNR]) as RecepieIngredient[];
	response.json(ingredients);
})

app.get("/ingredients", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.redirect("/");
		return;
	}
	const ingredients = await query("SELECT * FROM ZUTAT") as Ingredient[];
	let insertHtml = "";

	for (const ingredient of ingredients) {
		insertHtml += `<div class="col-md-4 mb-4">
                <div class="card">
                    <img src="assets/images/ingredient${ingredient.ZUTATENNR}.png" class="card-img-top" alt="${ingredient.BEZEICHNUNG}">
                    <div class="card-body">
                        <h5 class="card-title">${ingredient.BEZEICHNUNG}</h5>
                        <p class="card-text">Preis: ${ingredient.NETTOPREIS}€</p>
                        <a href="ingredient-detail.php?id=${ingredient.ZUTATENNR}" class="btn btn-primary">Details</a>
                    </div>
                </div>
            </div>
			`;
	}

	response.send(`${getHeader(loggedIn, "Zutaten")}
	
	<div class="container mt-5">
		<h1>Alle Zutaten</h1>
		${insertHtml}
	</div>
	
	${getHtmlFile("footer.html")}`)
})

app.get("/recepies", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.redirect("/");
		return;
	}
	const recepies = await query("SELECT * FROM REZEPTE") as Recepie[];
	let insertHtml = "";
	for (const recepie of recepies) {
		insertHtml += `
				<div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="/assets/images/recepie${recepie.REZEPTNR}.png" class="card-img-top" alt="${recepie.REZEPT}">
                        <div class="card-body">
                            <h5 class="card-title">${recepie.REZEPT}</h5>
                            <p class="card-text">Portionen: ${recepie.PORTIONEN}</p>
                            <a href="recipe-detail?id=${recepie.REZEPTNR}" class="btn btn-primary">Details</a>
                        </div>
                    </div>
                </div>
				`;
	}

	response.send(`${getHeader(loggedIn, "Rezepte")}

	<div class="container mt-5">
		<h1>Alle Rezepte</h1>
		${insertHtml}
	</div>

	${getHtmlFile("footer.html")}`);
})

app.get("/", async(request: Request, response: Response) => {
	console.log("validate start");
	const loggedIn = await validateAuthToken(request.cookies.auth);
	console.log("validate end");
	console.log("send start");
	response.send(`${getHeader(loggedIn, "Startseite")}

	<div class="container mt-5">
		<h1>Willkommen bei Kraut & Rüben</h1>
		<p>Entdecken Sie unsere leckeren Rezepte und Zutaten!</p>
	</div>

	${getHtmlFile("footer.html")}`);
	console.log("send end");
})

app.listen(port, () => {
	console.log(`Serving on http://localhost:${port}`);
})
