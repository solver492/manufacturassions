import { pgTable, text, serial, integer, boolean, numeric, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 100 }),
  role: varchar("role", { length: 20 }).default("admin"),
  createdAt: timestamp("created_at").defaultNow()
});

// Sites (clients) table
export const sites = pgTable("sites", {
  id: serial("id").primaryKey(),
  nomSite: varchar("nom_site", { length: 100 }).notNull(),
  ville: varchar("ville", { length: 50 }).notNull(),
  adresse: text("adresse").notNull(),
  contactNom: varchar("contact_nom", { length: 100 }),
  contactTelephone: varchar("contact_telephone", { length: 20 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  tarifHoraire: numeric("tarif_horaire", { precision: 10, scale: 2 }),
  notes: text("notes"),
  actif: boolean("actif").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Prestations (jobs) table
export const prestations = pgTable("prestations", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull().references(() => sites.id),
  datePrestation: varchar("date_prestation").notNull(),
  heureDebut: varchar("heure_debut"),
  heureFin: varchar("heure_fin"),
  nbManutentionnaires: integer("nb_manutentionnaires").notNull(),
  nbCamions: integer("nb_camions").default(0),
  montantPrevu: numeric("montant_prevu", { precision: 10, scale: 2 }),
  montantFacture: numeric("montant_facture", { precision: 10, scale: 2 }),
  statutPaiement: varchar("statut_paiement", { length: 20 }).default("en_attente"),
  statutPrestation: varchar("statut_prestation", { length: 20 }).default("planifie"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});

// Employees table
export const employes = pgTable("employes", {
  id: serial("id").primaryKey(),
  nom: varchar("nom", { length: 50 }).notNull(),
  prenom: varchar("prenom", { length: 50 }).notNull(),
  telephone: varchar("telephone", { length: 20 }),
  salaireJournalier: numeric("salaire_journalier", { precision: 8, scale: 2 }),
  specialite: varchar("specialite", { length: 50 }),
  actif: boolean("actif").default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Employee assignments table
export const affectations = pgTable("affectations", {
  id: serial("id").primaryKey(),
  prestationId: integer("prestation_id").notNull().references(() => prestations.id),
  employeId: integer("employe_id").notNull().references(() => employes.id),
  present: boolean("present").default(true),
  heuresTravaillees: numeric("heures_travaillees", { precision: 4, scale: 2 })
});

// Vehicles table
export const vehicules = pgTable("vehicules", {
  id: serial("id").primaryKey(),
  immatriculation: varchar("immatriculation", { length: 20 }).notNull().unique(),
  typeVehicule: varchar("type_vehicule", { length: 50 }),
  capacite: varchar("capacite", { length: 50 }),
  statut: varchar("statut", { length: 20 }).default("disponible"),
  createdAt: timestamp("created_at").defaultNow()
});

// Invoices table
export const factures = pgTable("factures", {
  id: serial("id").primaryKey(),
  prestationId: integer("prestation_id").notNull().references(() => prestations.id),
  numeroFacture: varchar("numero_facture", { length: 50 }).notNull().unique(),
  dateEmission: varchar("date_emission").notNull(),
  dateEcheance: varchar("date_echeance"),
  montantHt: numeric("montant_ht", { precision: 10, scale: 2 }),
  tva: numeric("tva", { precision: 10, scale: 2 }),
  montantTtc: numeric("montant_ttc", { precision: 10, scale: 2 }),
  statut: varchar("statut", { length: 20 }).default("brouillon"),
  fichierPdf: varchar("fichier_pdf", { length: 255 })
});

export function syncStatutPrestationPaiement(statutPrestation: string, statutPaiement: string) {
  if (statutPrestation === "annule") {
    return { newStatutPrestation: "annule", newStatutPaiement: "annule" };
  }

  if (statutPaiement === "paye") {
    return { newStatutPrestation: "termine", newStatutPaiement: "paye" };
  }

  if (statutPaiement === "retard") {
    return { newStatutPrestation: "termine", newStatutPaiement: "retard" };
  }

  if (statutPrestation === "termine") {
    return { newStatutPrestation: "termine", newStatutPaiement: "en_attente" };
  }

  return { newStatutPrestation: statutPrestation, newStatutPaiement: "en_attente" };
}

// Create Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertSiteSchema = createInsertSchema(sites).omit({ id: true, createdAt: true });
export const insertPrestationSchema = createInsertSchema(prestations).omit({ id: true, createdAt: true });
export const insertEmployeSchema = createInsertSchema(employes).omit({ id: true, createdAt: true });
export const insertAffectationSchema = createInsertSchema(affectations).omit({ id: true });
export const insertVehiculeSchema = createInsertSchema(vehicules).omit({ id: true, createdAt: true });
export const insertFactureSchema = createInsertSchema(factures).omit({ id: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Site = typeof sites.$inferSelect;
export type InsertSite = z.infer<typeof insertSiteSchema>;

export type Prestation = typeof prestations.$inferSelect;
export type InsertPrestation = z.infer<typeof insertPrestationSchema>;

export type Employe = typeof employes.$inferSelect;
export type InsertEmploye = z.infer<typeof insertEmployeSchema>;

export type Affectation = typeof affectations.$inferSelect;
export type InsertAffectation = z.infer<typeof insertAffectationSchema>;

export type Vehicule = typeof vehicules.$inferSelect;
export type InsertVehicule = z.infer<typeof insertVehiculeSchema>;

export type Facture = typeof factures.$inferSelect;
export type InsertFacture = z.infer<typeof insertFactureSchema>;