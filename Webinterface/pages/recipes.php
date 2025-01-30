<?php
$pageTitle = "Rezepte";
require_once '../includes/header.php';
require_once '../includes/db-config.php';

try {
    $stmt = $conn->query("SELECT * FROM REZEPTE");
    $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

<div class="container mt-5">
    <h1>Alle Rezepte</h1>
    <div class="row">
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
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>