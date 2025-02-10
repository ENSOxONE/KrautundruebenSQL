export type User = {
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
    PASSWORDHASH: string,
    SESSIONTOKEN: string
}

export type Recipe = {
    REZEPTNR: number,
    REZEPT: string,
    ZUBEREITUNG: string,
    PORTIONEN: string
}

export type Ingredient = {
    ZUTATENNR: number,
    BEZEICHNUNG: string,
    EINHEIT: string,
    NETTOPREIS: number,
    BESTAND: number,
    LIEFERANT: number,
    KALORIEN: number,
    KOHLENHYDRATE: number,
    PROTEIN: number
}

export type RecipeIngredient = {
    REZEPTNR: number,
    ZUTATENNR: number,
    MENGE: number,
    EINHEIT: string
}

export type ApiIngredient = {
    BEZEICHNUNG: string,
    EINHEIT: string,
    MENGE: number
}

export type Supplier = {
    LIEFERANTENNR: number,
    LIEFERANTENNAME: string,
    STRASSE: string,
    HAUSNR: number,
    PLZ: string,
    ORT: string,
    TELEFON: string,
    EMAIL: string
}

export type Category = {
    KETEGORIENR: number,
    KATEGORIE: string,
    BESCHREIBUNG: string
}

export type Allergen = {
    ALLERGENNR: number,
    ALLERGEN: string
}
