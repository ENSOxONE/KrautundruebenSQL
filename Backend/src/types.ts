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

export type Recepie = {
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

export type RecepieIngredient = {
    REZEPTNR: number,
    ZUTATENNR: number,
    MENGE: number,
    EINHEIT: string
}
