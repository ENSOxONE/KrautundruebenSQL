<?php
$pageTitle = "Profil";
require_once '../includes/header.php';

if (!isset($_SESSION['loggedin'])) {
    header("Location: login.php");
    exit;
}

require_once '../includes/db-config.php';

try {
    $stmt = $conn->prepare("SELECT * FROM KUNDE WHERE KUNDENNR = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

<div class="container mt-5">
    <h1>Mein Profil</h1>
    <div class="row">
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Persönliche Daten</h5>
                    <p class="card-text">
                        Name: <?= $user['VORNAME'] ?> <?= $user['NACHNAME'] ?><br>
                        E-Mail: <?= $user['EMAIL'] ?><br>
                        Adresse: <?= $user['STRASSE'] ?> <?= $user['HAUSNR'] ?>, <?= $user['PLZ'] ?> <?= $user['ORT'] ?>
                    </p>
                    <a href="#" class="btn btn-primary">Daten bearbeiten</a>
                </div>
            </div>
        </div>
        
        <div class="col-md-6">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Meine Bestellungen</h5>
                    <!-- Order history would go here -->
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once '../includes/footer.php'; ?>
