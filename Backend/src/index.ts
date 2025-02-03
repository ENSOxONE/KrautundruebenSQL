import { generateRandomHex } from "./utils/randomString";
import { getHeader, getHtmlFile } from "./utils/html";
import express, { Request, Response } from "express";
import { User, Recepie, Ingredient, RecepieIngredient } from "./types";
import { sha512 } from "./utils/hashing";
import cookieParser from "cookie-parser";
import { query } from "./utils/db";
import path from "path";
import { validateAuthToken } from "./utils/auth";
import { Card } from "./html_elements/Card";
import { CardText } from "./html_elements/CardText";
import { CardTitle } from "./html_elements/CardTitle";
import { RawHtml } from "./html_elements/RawHtml";
import { ProfileInformation } from "./html_elements/ProfileInformation";

const app = express();
const port = 8080;

app.use(express.static(path.join(__dirname, "www", "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.post("/login", async(request: Request, response: Response) => {
	console.log(request.body);
	const user = (await query(`SELECT * FROM KUNDE WHERE EMAIL = ?`, [request.body.email]) as User[])[0];
	if (!user) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').status(404).redirect("/loginerror.html?errormessage=User not found.")
		return;
	}
	if (user.PASSWORDHASH == sha512(request.body.password)) {
		const sessionToken = generateRandomHex();
		await query(`UPDATE KUNDE SET SESSIONTOKEN = ? WHERE KUNDENNR = ?`, [sessionToken, user.KUNDENNR]);
		response.setHeader('Cache-Control', 'no-store, max-age=0').cookie("auth", sessionToken).status(200).redirect("/");
		return;
	} else {
		response.setHeader('Cache-Control', 'no-store, max-age=0').status(403).redirect("/loginerror.html?errormessage=Invalid Password.")
		return;
	}
})

app.get("/loginerror", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Login Fehler")}
	
	<div class="container mt-5">
		<h1>Fehler beim Login</h1>
		<p id="errormessage"></p>
	</div>

    <script>
        document.getElementById("errormessage").textContent = new URLSearchParams(window.location.search).get("errormessage");
    </script>
	
	${getHtmlFile("footer.html")}`);
})

app.get("/logout", async(request: Request, response: Response) => {
	await query("UPDATE KUNDE SET SESSIONTOKEN = NULL WHERE SESSIONTOKEN = ?", [request.cookies.auth]);
	response.setHeader('Cache-Control', 'no-store, max-age=0').cookie("auth", "").redirect("/");
})

app.post("/ingredients", async(request: Request, response: Response) => {
	if (!request.body.recepieId) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').status(400).json({
			success: false,
			errors: [
				"Missing recepieId parameter."
			]
		})
		return;
	}

	const recepie = (await query("SELECT * FROM REZEPTE WHERE REZEPTNR = ?", [request.body.recepieId]) as Recepie[])[0];
	if (!recepie) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').status(404).json({
			success: false,
			errors: [
				"Recepie not found."
			]
		})
		return;
	}
	const ingredients = await query("SELECT * FROM REZEPTZUTATEN WHERE REZEPTNR = ?", [recepie.REZEPTNR]) as RecepieIngredient[];
	response.setHeader('Cache-Control', 'no-store, max-age=0').json(ingredients);
})

app.get("/ingredients", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	const ingredients = await query("SELECT * FROM ZUTAT") as Ingredient[];
	let insertHtml = "";

	for (const ingredient of ingredients) {
		const card: Card = new Card();
		card.addElement(new CardTitle(ingredient.BEZEICHNUNG));
		card.addElement(new CardText(`Preis: ${ingredient.NETTOPREIS}`));
		card.addElement(new RawHtml(`<a href="ingredient-detail.php?id=${ingredient.ZUTATENNR}" class="btn btn-primary">Details</a>`));
		card.setImage(`assets/images/ingredient${ingredient.ZUTATENNR}.png`, ingredient.BEZEICHNUNG)
		insertHtml += card.getHtml() + "\n";
	}

	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Zutaten")}
	
	<div class="container mt-5">
		<h1>Alle Zutaten</h1>
		${insertHtml}
	</div>
	
	${getHtmlFile("footer.html")}`)
})

app.get("/recepies", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	const recepies = await query("SELECT * FROM REZEPTE") as Recepie[];
	let insertHtml = "";
	for (const recepie of recepies) {
		const card: Card = new Card();
		card.addElement(new CardTitle(recepie.REZEPT));
		card.addElement(new CardText(`Portionen: ${recepie.PORTIONEN}`));
		card.addElement(new RawHtml(`<a href="recipe-detail?id=${recepie.REZEPTNR}" class="btn btn-primary">Details</a>`));
		card.setImage(`assets/images/recepie${recepie.REZEPTNR}.png`, recepie.REZEPT)
		insertHtml += card.getHtml() + "\n";
	}

	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Rezepte")}

	<div class="container mt-5">
		<h1>Alle Rezepte</h1>
		${insertHtml}
	</div>

	${getHtmlFile("footer.html")}`);
})

app.get("/profile", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}

	const userObject: User = (await query("SELECT * FROM KUNDE WHERE SESSIONTOKEN = ?", [request.cookies.auth]) as User[])[0];

	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Profil")}

	${new ProfileInformation(userObject).getHtml()}

	${getHtmlFile("footer.html")}`);
})

app.get("/edit-profile", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}

	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Profil Bearbeiten")}
	
	${getHtmlFile("edit-profile.html")}
	
	${getHtmlFile("footer.html")}`);
})

app.get("/api/profile-information", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}

	const userObject: User = (await query("SELECT * FROM KUNDE WHERE SESSIONTOKEN = ?", [request.cookies.auth]) as User[])[0];

	response.setHeader('Cache-Control', 'no-store, max-age=0').json({
		firstName: userObject.VORNAME,
		lastName: userObject.NACHNAME,
		email: userObject.EMAIL,
		street: userObject.STRASSE,
		houseNumber: userObject.HAUSNR,
		postalCode: userObject.PLZ,
		city: userObject.ORT,
		phone: userObject.TELEFON
	})
})

app.post("/api/update-profile", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	const passwordCorrect: boolean = (await query("SELECT * FROM KUNDE WHERE PASSWORDHASH = ?", [sha512(request.body.password)]) as User[]).length > 0;
	if (!passwordCorrect) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').status(403).contentType("text/plain").send("Incorrect password!");
		return;
	}
	await query("UPDATE KUNDE SET NACHNAME = ?, VORNAME = ?, STRASSE = ?, HAUSNR = ?, PLZ = ?, TELEFON = ?, EMAIL = ? WHERE SESSIONTOKEN = ?", [request.body.lastName, request.body.firstName, request.body.street, request.body.houseNumber, request.body.postalCode, request.body.phone, request.body.email, request.cookies.auth]);
	response.setHeader('Cache-Control', 'no-store, max-age=0').status(200).json({});
})

app.get("/", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);

	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Startseite")}

	<div class="container mt-5">
		<h1>Willkommen bei Kraut & Rüben</h1>
		<p>Entdecken Sie unsere leckeren Rezepte und Zutaten!</p>
	</div>

	${getHtmlFile("footer.html")}`);
})

app.listen(port, () => {
	console.log(`Serving on http://localhost:${port}`);
})
