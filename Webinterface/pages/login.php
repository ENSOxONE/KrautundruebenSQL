<?php include 'includes/header.php'; ?>

<main>
    <section class="login-section">
        <h2>Login</h2>
        <form action="login_process.php" method="POST">
            <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" name="email" id="email" required>
            </div>
            <div class="form-group">
                <label for="password">Passwort:</label>
                <input type="password" name="password" id="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <?php
        if(isset($_GET['error'])){
            echo '<p class="error">'.htmlspecialchars($_GET['error']).'</p>';
        }
        ?>
    </section>
</main>

<?php include 'includes/footer.php'; ?>
