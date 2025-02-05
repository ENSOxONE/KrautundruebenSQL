import { generateRandomHex } from "./utils/randomString";
import { getHeader, getHtmlFile } from "./utils/html";
import express, { Request, Response } from "express";
import { User, Recipe, Ingredient, RecipeIngredient, Supplier, ApiIngredient } from "./types";
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
	if (!request.body.recipeId) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').status(400).json({
			success: false,
			errors: [
				"Missing recipeId parameter."
			]
		})
		return;
	}

	const recipe = (await query("SELECT * FROM REZEPTE WHERE REZEPTNR = ?", [request.body.recipeId]) as Recipe[])[0];
	if (!recipe) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').status(404).json({
			success: false,
			errors: [
				"Recipe not found."
			]
		})
		return;
	}
	const ingredients = await query("SELECT * FROM REZEPTZUTATEN WHERE REZEPTNR = ?", [recipe.REZEPTNR]) as RecipeIngredient[];
	response.setHeader('Cache-Control', 'no-store, max-age=0').json(ingredients);
})

app.get("/ingredient-detail", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	const ingredient: Ingredient = (await query("SELECT * FROM ZUTAT WHERE ZUTATENNR = ?", [request.query.id]) as Ingredient[])[0];
	if (!ingredient) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	const supplier: Supplier = (await query("SELECT * FROM LIEFERANT WHERE LIEFERANTENNR = ?", [ingredient.LIEFERANT]) as Supplier[])[0];
	const card: Card = new Card();
	card.addElement(new CardTitle(ingredient.BEZEICHNUNG));
	card.addElement(new CardText(`Preis: ${ingredient.NETTOPREIS}€`));
	card.addElement(new CardText(`Kohlenhydrate: ${ingredient.KOHLENHYDRATE}`));
	card.addElement(new CardText(`Protein: ${ingredient.PROTEIN}`));
	card.addElement(new RawHtml(`<a href="/ingredients" class="btn btn-primary">Zurück</a>`));
	card.setImage(`assets/images/ingredient${ingredient.ZUTATENNR}.png`, ingredient.BEZEICHNUNG);
	const supplierCard: Card = new Card();
	supplierCard.addElement(new CardTitle("Lieferant"));
	supplierCard.addElement(new CardText(`Name: ${supplier.LIEFERANTENNAME}`));
	supplierCard.addElement(new CardText(`Email: ${supplier.EMAIL}`));
	supplierCard.addElement(new CardText(`Telefon: ${supplier.TELEFON}`));
	supplierCard.addElement(new CardText(`Addresse: ${supplier.STRASSE} ${supplier.HAUSNR}, ${supplier.PLZ} ${supplier.ORT}`));
	supplierCard.addElement(new RawHtml(`<a href="/ingredients" class="btn btn-primary">Zurück</a>`));
	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, ingredient.BEZEICHNUNG)}
	
<div class="container">
  <h1>Alle Zutaten</h1>
  <div class="row g-4">
    <!-- First Card -->
    <div class="col-md-8">
      <div id="recipesResults">
        <div class="card border-0 custom-card"> <!-- Add custom-card class -->
          <div class="row g-0">
            <!-- Image Column -->
            <div class="col-md-4 position-relative">
              <img src="assets/images/ingredient1001.png" class="img-fluid h-100 rounded-start" alt="Zucchini">
              <!-- Gradient overlay -->
              <div class="gradient-overlay-right"></div>
            </div>
            <!-- Content Column -->
            <div class="col-md-8 ps-4">
              <div class="card-body">
                <h5 class="card-title mb-4">Zucchini</h5>
                <p class="card-text">Preis: 0.89€</p>
                <p class="card-text">Kohlenhydrate: 2.00</p>
                <p class="card-text">Protein: 1.60</p>
                <div class="mt-4">
                  <a href="/ingredients" class="btn btn-primary">Zurück</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Supplier Card -->
    <div class="col-md-4">
      <div id="ingredientsResults">
        ${supplierCard.getHtml()} <!-- This remains unchanged -->
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom styles for the first card */
  .custom-card {
    overflow: hidden; /* Contain the gradient overlay */
  }

  .gradient-overlay-right::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 30px;
    background: linear-gradient(90deg, transparent 0%, var(--bs-body-bg) 100%); /* Use body background color */
    pointer-events: none;
  }

  .rounded-start {
    border-radius: var(--bs-card-border-radius) 0 0 var(--bs-card-border-radius) !important;
  }
</style>
	
	${getHtmlFile("footer.html")}`);
})

app.get("/api/recipe/:recipeId", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').json({
			success: false,
			errors: [
				"Not authenticated"
			]
		});
		return;
	}

	const recipe: Recipe = (await query("SELECT * FROM REZEPTE WHERE REZEPTNR = ?", [request.params.recipeId]) as Recipe[])[0];
	if (!recipe) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').json({
			success: false,
			errors: [
				"Recipe not found"
			]
		});
		return;
	}
	response.setHeader('Cache-Control', 'no-store, max-age=0').json(recipe);
})

app.get("/api/recipe/:recipeId/ingredients", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').json({
			success: false,
			errors: [
				"Not authenticated"
			]
		});
		return;
	}

	const recipe: Recipe = (await query("SELECT * FROM REZEPTE WHERE REZEPTNR = ?", [request.params.recipeId]) as Recipe[])[0];
	if (!recipe) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').json({
			success: false,
			errors: [
				"Recipe not found"
			]
		});
		return;
	}

	const ingredients: RecipeIngredient[] = await query("SELECT * FROM REZEPTZUTATEN WHERE REZEPTNR = ?", [recipe.REZEPTNR]) as RecipeIngredient[];
	if (!ingredients) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').json({
			success: false,
			errors: [
				"Ingredients not found"
			]
		});
		return;
	}

	const returnIngredients: ApiIngredient[] = [];
	for (const ingredient of ingredients) {
		const realIngredient: Ingredient = (await query("SELECT * FROM ZUTAT WHERE ZUTATENNR = ?", [ingredient.ZUTATENNR]) as Ingredient[])[0];
		returnIngredients.push({
			BEZEICHNUNG: realIngredient.BEZEICHNUNG,
			EINHEIT: ingredient.EINHEIT,
			MENGE: ingredient.MENGE
		})
	}

	response.setHeader('Cache-Control', 'no-store, max-age=0').json({
		success: true,
		result: returnIngredients
	});
})

app.get("/recipe-detail", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Rezept")}
	
	${getHtmlFile("recipe-detail.html")}
	
	${getHtmlFile("footer.html")}`)
})

app.get("/ingredients", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	const ingredients = await query("SELECT * FROM ZUTAT") as Ingredient[];
	let insertHtml1 = "";
	let insertHtml2 = "";
	let i = 0;
	for (const ingredient of ingredients) {
		const card: Card = new Card();
		card.addElement(new CardTitle(ingredient.BEZEICHNUNG));
		card.addElement(new CardText(`Preis: ${ingredient.NETTOPREIS}`));
		card.addElement(new RawHtml(`<a href="ingredient-detail?id=${ingredient.ZUTATENNR}" class="btn btn-primary">Details</a>`));
		card.setImage(`assets/images/ingredient${ingredient.ZUTATENNR}.png`, ingredient.BEZEICHNUNG)
		if (i % 2 == 0) {
			insertHtml1 += card.getHtml() + "\n";
		} else {
			insertHtml2 += card.getHtml() + "\n";
		}
		i++;
	}

	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Zutaten")}
	
	<div class="container"> <!-- Add container here -->
		<h1>Alle Zutaten</h1>
		<div class="row g-4">
			<div class="col-md-6">
			<div class="row g-4" id="recipesResults">${insertHtml1}</div>
		</div>
			<div class="col-md-6">
			<div class="row g-4" id="ingredientsResults">${insertHtml2}</div>
		</div>
		</div>
	</div>
	
	${getHtmlFile("footer.html")}`)
})

app.get("/recipes", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	const recipes = await query("SELECT * FROM REZEPTE") as Recipe[];
	let insertHtml1 = "";
	let insertHtml2 = "";
	let i = 0;
	for (const recipe of recipes) {
		const card: Card = new Card();
		card.addElement(new CardTitle(recipe.REZEPT));
		card.addElement(new RawHtml(`<a href="recipe-detail?id=${recipe.REZEPTNR}" class="btn btn-primary">Details</a>`));
		card.setImage(`assets/images/recipe${recipe.REZEPTNR}.png`, recipe.REZEPT)
		if (i % 2 == 0) {
			insertHtml1 += card.getHtml() + "\n";
		} else {
			insertHtml2 += card.getHtml() + "\n";
		}
		i++;
	}

	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Rezepte")}

	<div class="container"> <!-- Add container here -->
		<div>
			<h1>Alle Rezepte</h1>
			<div class="row g-4">
				<div class="col-md-6">
					<div class="row g-4" id="recipesResults">${insertHtml1}</div>
				</div>

				<div class="col-md-6">
					<div class="row g-4" id="ingredientsResults">${insertHtml2}</div>
				</div>
			</div>
		</div>
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

app.get("/search", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	response.setHeader('Cache-Control', 'no-store, max-age=0').send(`${getHeader(loggedIn, "Suche")}
	
	${getHtmlFile("search.html")}
	
	${getHtmlFile("footer.html")}`)
})

app.post("/api/search", async(request: Request, response: Response) => {
	const loggedIn = await validateAuthToken(request.cookies.auth);
	if (!loggedIn) {
		response.setHeader('Cache-Control', 'no-store, max-age=0').redirect("/");
		return;
	}
	const stripped = request.body.searchQuery && request.body.searchQuery.trim() || null;
	if (!stripped || stripped == "") {
		response.setHeader('Cache-Control', 'no-store, max-age=0').json({
			success: false,
			errors: [         
				(stripped ? "Search query can't be empty." : "searchQuery parameter not specified.")
			]
		})
	}
	const matchingIngredients = await query("SELECT * FROM ZUTAT WHERE BEZEICHNUNG LIKE ?", [`%${stripped}%`]) as Ingredient[];
	const recipes: Recipe[] = await query("SELECT * FROM REZEPTE WHERE REZEPT LIKE ?", [`%${stripped}%`]) as Recipe[];
	for (const v of matchingIngredients) {
		const recipeIngredients = await query("SELECT * FROM REZEPTZUTATEN WHERE ZUTATENNR = ?", [v.ZUTATENNR]) as RecipeIngredient[];
		for (const recipeIngredient of recipeIngredients) {
			const recipe = (await query("SELECT * FROM REZEPTE WHERE REZEPTNR = ?", [recipeIngredient.REZEPTNR]) as Recipe[])[0];
			let includes = false;
			recipes.forEach((_recipe: Recipe) => {
				if (_recipe.REZEPT == recipe.REZEPT) includes = true;
			})
			if (!includes) {
				recipes.push(recipe);
			}
		}
	}
	response.setHeader('Cache-Control', 'no-store, max-age=0').json({
		success: true,
		results: {
			ingredients: matchingIngredients,
			recipes: recipes
		}
	})
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
