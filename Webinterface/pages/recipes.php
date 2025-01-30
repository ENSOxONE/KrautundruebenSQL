<?php
$pageTitle = "Rezepte";
require_once '../includes/header.php';

// Include database configuration
require_once '../includes/db-config.php';

// Check if $conn is set and valid
if (!isset($conn)) {
    die("Database connection failed.");
}

try {
    // Fetch all recipes from the database
    $stmt = $conn->query("SELECT * FROM REZEPTE");
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Handle database errors
    die("Database error: " . $e->getMessage());
}
?>

<div class="container mt-5">
    <h1>Alle Rezepte</h1>
    <div class="row">
        <?php if (!empty($recipes)): ?>
            <?php foreach ($recipes as $recipe): ?>
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="../assets/images/<?= $recipe['REZEPTNR'] ?>.jpg" class="card-img-top" alt="<?= $recipe['REZEPT'] ?>">
                        <div class="card-body">
                            <h5 class="card-title"><?= $recipe['REZEPT'] ?></h5>
                            <p class="card-text">Portionen: <?= $recipe['PORTIONEN'] ?></p>
                            <a href="recipe-detail.php?id=<?= $recipe['REZEPTNR'] ?>" class="btn btn-primary">Details</a>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
            <div class="col-12">
                <p>Keine Rezepte gefunden.</p>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
