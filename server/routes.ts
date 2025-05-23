import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { 
  insertUserSchema, 
  insertSiteSchema, 
  insertPrestationSchema,
  insertEmployeSchema,
  insertVehiculeSchema,
  insertFactureSchema
} from "@shared/schema";
import { z } from "zod";
import { syncStatutPrestationPaiement } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "mon-auxiliaire-secret-key";

// Middleware for authentication
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Authentification requise" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Token invalide ou expiré" });
    }

    (req as any).user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
      }

      const user = await storage.validateUserCredentials(username, password);

      if (!user) {
        return res.status(401).json({ message: "Identifiants invalides" });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password before sending user data
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Ce nom d'utilisateur existe déjà" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Remove password before sending user data
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }

      console.error("Registration error:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.get("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // Remove password before sending user data
      const { password: _, ...userWithoutPassword } = user;

      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du profil" });
    }
  });

  app.patch("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { username, email, currentPassword, newPassword } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      // If changing password, verify current password
      if (currentPassword && newPassword) {
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ message: "Mot de passe actuel incorrect" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
      }

      // Update other fields
      user.username = username;
      user.email = email;

      // Save updated user
      await storage.updateUser(userId, user);

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
    }
  });

  // Sites routes
  app.get("/api/sites", authenticateToken, async (req, res) => {
    try {
      const sites = await storage.getAllSites();
      res.json(sites);
    } catch (error) {
      console.error("Sites fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des sites" });
    }
  });

  app.get("/api/sites/:id", authenticateToken, async (req, res) => {
    try {
      const siteId = parseInt(req.params.id);
      const site = await storage.getSite(siteId);

      if (!site) {
        return res.status(404).json({ message: "Site non trouvé" });
      }

      res.json(site);
    } catch (error) {
      console.error("Site fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du site" });
    }
  });

  app.post("/api/sites", authenticateToken, async (req, res) => {
    try {
      const siteData = insertSiteSchema.parse(req.body);
      const newSite = await storage.createSite(siteData);
      res.status(201).json(newSite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }

      console.error("Site creation error:", error);
      res.status(500).json({ message: "Erreur lors de la création du site" });
    }
  });

  app.put("/api/sites/:id", authenticateToken, async (req, res) => {
    try {
      const siteId = parseInt(req.params.id);
      const siteData = req.body;

      const updatedSite = await storage.updateSite(siteId, siteData);

      if (!updatedSite) {
        return res.status(404).json({ message: "Site non trouvé" });
      }

      res.json(updatedSite);
    } catch (error) {
      console.error("Site update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du site" });
    }
  });

  app.delete("/api/sites/:id", authenticateToken, async (req, res) => {
    try {
      const siteId = parseInt(req.params.id);
      const deleted = await storage.deleteSite(siteId);

      if (!deleted) {
        return res.status(404).json({ message: "Site non trouvé" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Site deletion error:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du site" });
    }
  });

  app.get("/api/sites/:id/prestations", authenticateToken, async (req, res) => {
    try {
      const siteId = parseInt(req.params.id);
      const prestations = await storage.getPrestationsBySiteId(siteId);
      res.json(prestations);
    } catch (error) {
      console.error("Site prestations fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des prestations du site" });
    }
  });

  // Prestations routes
  app.get("/api/prestations", authenticateToken, async (req, res) => {
    try {
      const prestations = await storage.getAllPrestations();
      res.json(prestations);
    } catch (error) {
      console.error("Prestations fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des prestations" });
    }
  });

  app.get("/api/prestations/:id", authenticateToken, async (req, res) => {
    try {
      const prestationId = parseInt(req.params.id);
      const prestation = await storage.getPrestation(prestationId);

      if (!prestation) {
        return res.status(404).json({ message: "Prestation non trouvée" });
      }

      res.json(prestation);
    } catch (error) {
      console.error("Prestation fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la prestation" });
    }
  });

  app.post("/api/prestations", authenticateToken, async (req, res) => {
    try {
      const prestationData = insertPrestationSchema.parse(req.body);
      const newPrestation = await storage.createPrestation(prestationData);
      res.status(201).json(newPrestation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }

      console.error("Prestation creation error:", error);
      res.status(500).json({ message: "Erreur lors de la création de la prestation" });
    }
  });

  app.put("/api/prestations/:id", authenticateToken, async (req, res) => {
    try {
      const prestationId = parseInt(req.params.id);
      const prestationData = req.body;

      const updatedPrestation = await storage.updatePrestation(prestationId, prestationData);

      if (!updatedPrestation) {
        return res.status(404).json({ message: "Prestation non trouvée" });
      }

      res.json(updatedPrestation);
    } catch (error) {
      console.error("Prestation update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de la prestation" });
    }
  });

  app.delete("/api/prestations/:id", authenticateToken, async (req, res) => {
    try {
      const prestationId = parseInt(req.params.id);
      const deleted = await storage.deletePrestation(prestationId);

      if (!deleted) {
        return res.status(404).json({ message: "Prestation non trouvée" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Prestation deletion error:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la prestation" });
    }
  });

  app.get("/api/prestations/calendar", authenticateToken, async (req, res) => {
    try {
      const prestations = await storage.getCalendarPrestations();
      res.json(prestations);
    } catch (error) {
      console.error("Calendar prestations fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des prestations du calendrier" });
    }
  });

  // Employes routes
  app.get("/api/employes", authenticateToken, async (req, res) => {
    try {
      const employes = await storage.getAllEmployes();
      res.json(employes);
    } catch (error) {
      console.error("Employes fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des employés" });
    }
  });

  app.get("/api/employes/:id", authenticateToken, async (req, res) => {
    try {
      const employeId = parseInt(req.params.id);
      const employe = await storage.getEmploye(employeId);

      if (!employe) {
        return res.status(404).json({ message: "Employé non trouvé" });
      }

      res.json(employe);
    } catch (error) {
      console.error("Employe fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'employé" });
    }
  });

  app.post("/api/employes", authenticateToken, async (req, res) => {
    try {
      const employeData = insertEmployeSchema.parse(req.body);
      const newEmploye = await storage.createEmploye(employeData);
      res.status(201).json(newEmploye);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }

      console.error("Employe creation error:", error);
      res.status(500).json({ message: "Erreur lors de la création de l'employé" });
    }
  });

  app.put("/api/employes/:id", authenticateToken, async (req, res) => {
    try {
      const employeId = parseInt(req.params.id);
      const employeData = req.body;

      const updatedEmploye = await storage.updateEmploye(employeId, employeData);

      if (!updatedEmploye) {
        return res.status(404).json({ message: "Employé non trouvé" });
      }

      res.json(updatedEmploye);
    } catch (error) {
      console.error("Employe update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'employé" });
    }
  });

  app.delete("/api/employes/:id", authenticateToken, async (req, res) => {
    try {
      const employeId = parseInt(req.params.id);
      const deleted = await storage.deleteEmploye(employeId);

      if (!deleted) {
        return res.status(404).json({ message: "Employé non trouvé" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Employe deletion error:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'employé" });
    }
  });

  app.get("/api/employes/:id/planning", authenticateToken, async (req, res) => {
    try {
      const employeId = parseInt(req.params.id);
      const planning = await storage.getEmployeePlanning(employeId);
      res.json(planning);
    } catch (error) {
      console.error("Employe planning fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du planning de l'employé" });
    }
  });

  // Vehicules routes
  app.get("/api/vehicules", authenticateToken, async (req, res) => {
    try {
      const vehicules = await storage.getAllVehicules();
      res.json(vehicules);
    } catch (error) {
      console.error("Vehicules fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des véhicules" });
    }
  });

  app.get("/api/vehicules/:id", authenticateToken, async (req, res) => {
    try {
      const vehiculeId = parseInt(req.params.id);
      const vehicule = await storage.getVehicule(vehiculeId);

      if (!vehicule) {
        return res.status(404).json({ message: "Véhicule non trouvé" });
      }

      res.json(vehicule);
    } catch (error) {
      console.error("Vehicule fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du véhicule" });
    }
  });

  app.post("/api/vehicules", authenticateToken, async (req, res) => {
    try {
      const vehiculeData = insertVehiculeSchema.parse(req.body);
      const newVehicule = await storage.createVehicule(vehiculeData);
      res.status(201).json(newVehicule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }

      console.error("Vehicule creation error:", error);
      res.status(500).json({ message: "Erreur lors de la création du véhicule" });
    }
  });

  app.put("/api/vehicules/:id", authenticateToken, async (req, res) => {
    try {
      const vehiculeId = parseInt(req.params.id);
      const vehiculeData = req.body;

      const updatedVehicule = await storage.updateVehicule(vehiculeId, vehiculeData);

      if (!updatedVehicule) {
        return res.status(404).json({ message: "Véhicule non trouvé" });
      }

      res.json(updatedVehicule);
    } catch (error) {
      console.error("Vehicule update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du véhicule" });
    }
  });

  app.delete("/api/vehicules/:id", authenticateToken, async (req, res) => {
    try {
      const vehiculeId = parseInt(req.params.id);
      const deleted = await storage.deleteVehicule(vehiculeId);

      if (!deleted) {
        return res.status(404).json({ message: "Véhicule non trouvé" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Vehicule deletion error:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du véhicule" });
    }
  });

  // Factures routes
  app.get("/api/factures", authenticateToken, async (req, res) => {
    try {
      const factures = await storage.getAllFactures();
      res.json(factures);
    } catch (error) {
      console.error("Factures fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des factures" });
    }
  });

  app.get("/api/factures/:id", authenticateToken, async (req, res) => {
    try {
      const factureId = parseInt(req.params.id);
      const facture = await storage.getFacture(factureId);

      if (!facture) {
        return res.status(404).json({ message: "Facture non trouvée" });
      }

      res.json(facture);
    } catch (error) {
      console.error("Facture fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la facture" });
    }
  });

  app.post("/api/factures", authenticateToken, async (req, res) => {
    try {
      const factureData = insertFactureSchema.parse(req.body);
      const newFacture = await storage.createFacture(factureData);
      res.status(201).json(newFacture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }

      console.error("Facture creation error:", error);
      res.status(500).json({ message: "Erreur lors de la création de la facture" });
    }
  });

  app.put("/api/factures/:id", authenticateToken, async (req, res) => {
    try {
      const factureId = parseInt(req.params.id);
      const factureData = req.body;

      const updatedFacture = await storage.updateFacture(factureId, factureData);

      if (!updatedFacture) {
        return res.status(404).json({ message: "Facture non trouvée" });
      }

      res.json(updatedFacture);
    } catch (error) {
      console.error("Facture update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de la facture" });
    }
  });

  app.put("/api/factures/:id/paiement", authenticateToken, async (req, res) => {
    try {
      const factureId = parseInt(req.params.id);
      const { statut } = req.body;

      if (!statut) {
        return res.status(400).json({ message: "Statut de paiement requis" });
      }

      const updatedFacture = await storage.updateFacturePaiement(factureId, statut);

      if (!updatedFacture) {
        return res.status(404).json({ message: "Facture non trouvée" });
      }

      // Récupérer la prestation
      const prestation = await storage.getPrestation(updatedFacture.prestationId);
      if (!prestation) {
        return res.status(404).json({ message: "Prestation non trouvée" });
      }

      // Synchroniser les statuts en fonction du statut de la facture
      let newStatutPrestation = prestation.statutPrestation;
      let newStatutPaiement = statut;

      if (statut === "brouillon") {
        newStatutPrestation = "en_attente";
        newStatutPaiement = "en_attente";
      } else if (statut === "envoyee") {
        newStatutPrestation = "en_cours";
        newStatutPaiement = "en_attente";
      } else if (statut === "payee") {
        newStatutPrestation = "termine";
        newStatutPaiement = "paye";
      }

      // Mettre à jour la prestation avec les nouveaux statuts
      await storage.updatePrestation(updatedFacture.prestationId, {
        statutPrestation: newStatutPrestation,
        statutPaiement: newStatutPaiement
      });

      // Mise à jour de la facture avec le nouveau statut
      await storage.updateFacture(factureId, {
        statut: statut
      });

      // Mise à jour automatique de la date d'échéance si nécessaire
      if (statut === "en_attente" && !updatedFacture.dateEcheance) {
        const dateEcheance = new Date();
        dateEcheance.setDate(dateEcheance.getDate() + 30);
        await storage.updateFacture(factureId, {
          dateEcheance: dateEcheance.toISOString().split('T')[0]
        });
      }



      res.json(updatedFacture);
    } catch (error) {
      console.error("Facture payment update error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du paiement de la facture" });
    }
  });

  app.get("/api/factures/:id/pdf", authenticateToken, async (req, res) => {
    try {
      const factureId = parseInt(req.params.id);
      const facture = await storage.getFacture(factureId);
      if (!facture) {
        return res.status(404).json({ message: "Facture non trouvée" });
      }

      const prestation = await storage.getPrestation(facture.prestationId);
      if (!prestation) {
        return res.status(404).json({ message: "Prestation non trouvée" });
      }

      const site = await storage.getSite(prestation.siteId);
      if (!site) {
        return res.status(404).json({ message: "Site non trouvé" });
      }

      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=facture-${facture.numeroFacture}.pdf`);

      doc.pipe(res);

      // En-tête
      doc.fontSize(20).text('FACTURE', { align: 'center' });
      doc.moveDown();

      // Informations facture
      doc.fontSize(12);
      doc.text(`Numéro de facture: ${facture.numeroFacture}`);
      doc.text(`Date d'émission: ${facture.dateEmission}`);
      doc.text(`Date d'échéance: ${facture.dateEcheance}`);
      doc.moveDown();

      // Informations client
      doc.fontSize(14).text('Client:', { underline: true });
      doc.fontSize(12);
      doc.text(site.nomSite);
      doc.text(site.adresse);
      doc.text(`${site.ville}`);
      doc.text(`Contact: ${site.contactNom}`);
      doc.moveDown();

      // Détails prestation
      doc.fontSize(14).text('Détails de la prestation:', { underline: true });
      doc.fontSize(12);
      doc.text(`Date: ${prestation.datePrestation}`);
      doc.text(`Horaires: ${prestation.heureDebut} - ${prestation.heureFin}`);
      doc.text(`Nombre de manutentionnaires: ${prestation.nbManutentionnaires}`);
      doc.text(`Nombre de camions: ${prestation.nbCamions}`);
      doc.moveDown();

      // Montants
      doc.fontSize(14).text('Montants:', { underline: true });
      doc.fontSize(12);
      doc.text(`Montant HT: ${facture.montantHt} €`);
      doc.text(`TVA: ${facture.tva} €`);
      doc.fontSize(14).text(`Montant TTC: ${facture.montantTtc} €`, { bold: true });

      doc.end();
    } catch (error) {
      console.error("Facture PDF generation error:", error);
      res.status(500).json({ message: "Erreur lors de la génération du PDF de la facture" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/kpis", authenticateToken, async (req, res) => {
    try {
      const kpis = await storage.getDashboardKpis();
      res.json(kpis);
    } catch (error) {
      console.error("Dashboard KPIs fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des KPIs du tableau de bord" });
    }
  });

  app.get("/api/dashboard/charts", authenticateToken, async (req, res) => {
    try {
      const charts = await storage.getDashboardCharts();
      res.json(charts);
    } catch (error) {
      console.error("Dashboard charts fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des graphiques du tableau de bord" });
    }
  });

  app.get("/api/dashboard/alerts", authenticateToken, async (req, res) => {
    try {
      const alerts = await storage.getDashboardAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Dashboard alerts fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des alertes du tableau de bord" });
    }
  });

  app.get("/api/dashboard/planning-jour", authenticateToken, async (req, res) => {
    try {
      const planning = await storage.getPlanningDuJour();
      res.json(planning);
    } catch (error) {
      console.error("Daily planning fetch error:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du planning du jour" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}