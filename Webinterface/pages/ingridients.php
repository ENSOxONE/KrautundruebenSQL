<?php
$pageTitle = "Zutaten";
require_once '../includes/header.php';
require_once '../includes/db-config.php';

try {
    $stmt = $conn->query("SELECT * FROM ZUTAT");
    $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

<div class="container mt-5">
    <h1>Alle Zutaten</h1>
    <div class="row">
        <?php foreach ($ingredients as $ingredient): ?>
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="../assets/images/<?= $ingredient['ZUTATENNR'] ?>.jpg" class="card-img-top" alt="<?= $ingredient['BEZEICHNUNG'] ?>">
                    <div class="card-body">
                        <h5 class="card-title"><?= $ingredient['BEZEICHNUNG'] ?></h5>
                        <p class="card-text">Preis: <?= $ingredient['NETTOPREIS'] ?> €</p>
                        <a href="ingredient-detail.php?id=<?= $ingredient['ZUTATENNR'] ?>" class="btn btn-primary">Details</a>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
