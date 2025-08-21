const express = require("express"); // Import von Express
const userController = require("../controllers/User.controller"); // Import der Controller-Methoden

const router = express.Router(); // Erstellen eines neuen Router-Objekts

// GET /users - Alle Benutzer abrufen
router.get("/", userController.getUsers);

router.post("/", userController.createUser);

// GET /users/:id - Einen einzelnen Benutzer anhand der ID abrufen
router.get("/:id", userController.getUserById);

// PUT /users/:id - Einen Benutzer aktualisieren
router.put("/:id", userController.updateUser);

// DELETE /users/:id - Einen Benutzer löschen
router.delete("/:id", userController.deleteUser);
router.post("/bulk", userController.createUsersBulk);

// Exportieren der Routen
module.exports = router;
