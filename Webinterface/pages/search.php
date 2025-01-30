<?php
$pageTitle = "Suche";
require_once '../includes/header.php';
?>

<div class="container mt-5">
    <h1>Rezeptsuche</h1>
    <form class="mb-4">
        <div class="input-group">
            <input type="text" class="form-control" placeholder="Suche nach Rezepten oder Zutaten...">
            <button class="btn btn-primary" type="submit">Suchen</button>
        </div>
    </form>

    <!-- Filter Section -->
    <div class="filter-section mb-4">
        <h3>Filter</h3>
        <div class="row">
            <div class="col-md-3">
                <label for="allergy" class="form-label">Allergie</label>
                <select class="form-select" id="allergy">
                    <option value="">Keine</option>
                    <option value="laktose">Laktose</option>
                    <option value="gluten">Gluten</option>
                </select>
            </div>
            <div class="col-md-3">
                <label for="calories" class="form-label">Kalorien</label>
                <input type="number" class="form-control" id="calories" placeholder="Max">
            </div>
            <div class="col-md-3">
                <label for="price" class="form-label">Preis</label>
                <input type="number" class="form-control" id="price" placeholder="Max">
            </div>
            <div class="col-md-3">
                <label for="sort" class="form-label">Sortieren nach</label>
                <select class="form-select" id="sort">
                    <option value="price_asc">Preis aufsteigend</option>
                    <option value="price_desc">Preis absteigend</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                </select>
            </div>
        </div>
    </div>

    <!-- Search Results -->
    <div id="search-results">
        <!-- Results will be dynamically loaded here -->
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
