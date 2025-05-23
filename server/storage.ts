import bcrypt from 'bcrypt';
import { 
  User, InsertUser, 
  Site, InsertSite, 
  Prestation, InsertPrestation, 
  Employe, InsertEmploye, 
  Affectation, InsertAffectation,
  Vehicule, InsertVehicule,
  Facture, InsertFacture
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: User): Promise<User>;
  validateUserCredentials(username: string, password: string): Promise<User | null>;

  // Site methods
  getAllSites(): Promise<Site[]>;
  getSite(id: number): Promise<Site | undefined>;
  createSite(site: InsertSite): Promise<Site>;
  updateSite(id: number, site: Partial<InsertSite>): Promise<Site | undefined>;
  deleteSite(id: number): Promise<boolean>;

  // Prestation methods
  getAllPrestations(): Promise<Prestation[]>;
  getPrestation(id: number): Promise<Prestation | undefined>;
  createPrestation(prestation: InsertPrestation): Promise<Prestation>;
  updatePrestation(id: number, prestation: Partial<InsertPrestation>): Promise<Prestation | undefined>;
  deletePrestation(id: number): Promise<boolean>;
  getPrestationsBySiteId(siteId: number): Promise<Prestation[]>;
  getCalendarPrestations(): Promise<Prestation[]>;

  // Employe methods
  getAllEmployes(): Promise<Employe[]>;
  getEmploye(id: number): Promise<Employe | undefined>;
  createEmploye(employe: InsertEmploye): Promise<Employe>;
  updateEmploye(id: number, employe: Partial<InsertEmploye>): Promise<Employe | undefined>;
  deleteEmploye(id: number): Promise<boolean>;
  getEmployeePlanning(id: number): Promise<any[]>;

  // Affectation methods
  getAffectationsByPrestation(prestationId: number): Promise<Affectation[]>;
  createAffectation(affectation: InsertAffectation): Promise<Affectation>;
  deleteAffectation(id: number): Promise<boolean>;

  // Vehicule methods
  getAllVehicules(): Promise<Vehicule[]>;
  getVehicule(id: number): Promise<Vehicule | undefined>;
  createVehicule(vehicule: InsertVehicule): Promise<Vehicule>;
  updateVehicule(id: number, vehicule: Partial<InsertVehicule>): Promise<Vehicule | undefined>;
  deleteVehicule(id: number): Promise<boolean>;

  // Facture methods
  getAllFactures(): Promise<Facture[]>;
  getFacture(id: number): Promise<Facture | undefined>;
  createFacture(facture: InsertFacture): Promise<Facture>;
  updateFacture(id: number, facture: Partial<InsertFacture>): Promise<Facture | undefined>;
  updateFacturePaiement(id: number, statut: string): Promise<Facture | undefined>;
  getFactureByPrestation(prestationId: number): Promise<Facture | undefined>;

  // Dashboard methods
  getDashboardKpis(): Promise<any>;
  getDashboardCharts(): Promise<any>;
  getDashboardAlerts(): Promise<any>;
  getPlanningDuJour(): Promise<any[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sites: Map<number, Site>;
  private prestations: Map<number, Prestation>;
  private employes: Map<number, Employe>;
  private affectations: Map<number, Affectation>;
  private vehicules: Map<number, Vehicule>;
  private factures: Map<number, Facture>;
  
  private currentUserId: number;
  private currentSiteId: number;
  private currentPrestationId: number;
  private currentEmployeId: number;
  private currentAffectationId: number;
  private currentVehiculeId: number;
  private currentFactureId: number;
  
  constructor() {
    this.users = new Map();
    this.sites = new Map();
    this.prestations = new Map();
    this.employes = new Map();
    this.affectations = new Map();
    this.vehicules = new Map();
    this.factures = new Map();
    
    this.currentUserId = 1;
    this.currentSiteId = 1;
    this.currentPrestationId = 1;
    this.currentEmployeId = 1;
    this.currentAffectationId = 1;
    this.currentVehiculeId = 1;
    this.currentFactureId = 1;
    
    // Seed some initial data
    this.seedInitialData();
  }

  private async seedInitialData() {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    this.createUser({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@auxiliaire-demenagement.fr',
      role: 'admin'
    });
    
    // Create sample sites
    this.createSite({
      nomSite: 'SAS TechPro',
      ville: 'Paris',
      adresse: '17, Rue des Innovateurs',
      contactNom: 'Jean Dupont',
      contactTelephone: '0123456789',
      contactEmail: 'jean.dupont@techpro.fr',
      tarifHoraire: 95,
      notes: 'Client fidèle depuis 3 ans',
      actif: true
    });
    
    this.createSite({
      nomSite: 'Famille Martin',
      ville: 'Boulogne',
      adresse: '8, Avenue Victor Hugo',
      contactNom: 'Pierre Martin',
      contactTelephone: '0623456789',
      contactEmail: 'pierre.martin@gmail.com',
      tarifHoraire: 85,
      notes: 'Déménagement résidentiel',
      actif: true
    });
    
    this.createSite({
      nomSite: 'Agence ComNet',
      ville: 'Paris',
      adresse: '42, Rue de la Communication',
      contactNom: 'Sophie Leroy',
      contactTelephone: '0712345678',
      contactEmail: 's.leroy@comnet.fr',
      tarifHoraire: 90,
      notes: 'Prestation récurrente',
      actif: true
    });
    
    // Create sample employees
    this.createEmploye({
      nom: 'Dubois',
      prenom: 'Thomas',
      telephone: '0645678901',
      salaireJournalier: 100,
      specialite: 'Chef d\'équipe',
      actif: true
    });
    
    this.createEmploye({
      nom: 'Lambert',
      prenom: 'Julie',
      telephone: '0634567890',
      salaireJournalier: 90,
      specialite: 'Manutentionnaire',
      actif: true
    });
    
    // Create sample vehicles
    this.createVehicule({
      immatriculation: 'AB-123-CD',
      typeVehicule: 'Camion 20m³',
      capacite: '1500kg',
      statut: 'disponible'
    });
    
    this.createVehicule({
      immatriculation: 'EF-456-GH',
      typeVehicule: 'Utilitaire 12m³',
      capacite: '800kg',
      statut: 'disponible'
    });
    
    // Create sample prestations for today
    const today = new Date().toISOString().split('T')[0];
    
    this.createPrestation({
      siteId: 1,
      datePrestation: today,
      heureDebut: '08:00',
      heureFin: '12:00',
      nbManutentionnaires: 3,
      nbCamions: 2,
      montantPrevu: 1500,
      montantFacture: 1500,
      statutPaiement: 'en_attente',
      statutPrestation: 'en_cours',
      notes: 'Déménagement bureaux'
    });
    
    this.createPrestation({
      siteId: 2,
      datePrestation: today,
      heureDebut: '10:30',
      heureFin: '15:30',
      nbManutentionnaires: 2,
      nbCamions: 1,
      montantPrevu: 850,
      montantFacture: null,
      statutPaiement: 'en_attente',
      statutPrestation: 'planifie',
      notes: 'Déménagement appartement'
    });
    
    // Create sample affectations
    this.createAffectation({
      prestationId: 1,
      employeId: 1,
      present: true,
      heuresTravaillees: 4
    });
    
    this.createAffectation({
      prestationId: 1,
      employeId: 2,
      present: true,
      heuresTravaillees: 4
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async validateUserCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async updateUser(id: number, updatedUser: User): Promise<User> {
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Site Methods
  async getAllSites(): Promise<Site[]> {
    return Array.from(this.sites.values());
  }

  async getSite(id: number): Promise<Site | undefined> {
    return this.sites.get(id);
  }

  async createSite(insertSite: InsertSite): Promise<Site> {
    const id = this.currentSiteId++;
    const now = new Date();
    const site: Site = { 
      ...insertSite, 
      id, 
      createdAt: now 
    };
    this.sites.set(id, site);
    return site;
  }

  async updateSite(id: number, site: Partial<InsertSite>): Promise<Site | undefined> {
    const existingSite = this.sites.get(id);
    if (!existingSite) return undefined;
    
    const updatedSite = { ...existingSite, ...site };
    this.sites.set(id, updatedSite);
    return updatedSite;
  }

  async deleteSite(id: number): Promise<boolean> {
    return this.sites.delete(id);
  }

  // Prestation Methods
  async getAllPrestations(): Promise<Prestation[]> {
    return Array.from(this.prestations.values());
  }

  async getPrestation(id: number): Promise<Prestation | undefined> {
    return this.prestations.get(id);
  }

  async createPrestation(insertPrestation: InsertPrestation): Promise<Prestation> {
    const id = this.currentPrestationId++;
    const now = new Date();
    const prestation: Prestation = { 
      ...insertPrestation, 
      id, 
      createdAt: now 
    };
    this.prestations.set(id, prestation);
    return prestation;
  }

  async updatePrestation(id: number, prestation: Partial<InsertPrestation>): Promise<Prestation | undefined> {
    const existingPrestation = this.prestations.get(id);
    if (!existingPrestation) return undefined;
    
    const updatedPrestation = { ...existingPrestation, ...prestation };
    this.prestations.set(id, updatedPrestation);
    return updatedPrestation;
  }

  async deletePrestation(id: number): Promise<boolean> {
    return this.prestations.delete(id);
  }

  async getPrestationsBySiteId(siteId: number): Promise<Prestation[]> {
    return Array.from(this.prestations.values()).filter(
      (prestation) => prestation.siteId === siteId
    );
  }

  async getCalendarPrestations(): Promise<Prestation[]> {
    return Array.from(this.prestations.values());
  }

  // Employe Methods
  async getAllEmployes(): Promise<Employe[]> {
    return Array.from(this.employes.values());
  }

  async getEmploye(id: number): Promise<Employe | undefined> {
    return this.employes.get(id);
  }

  async createEmploye(insertEmploye: InsertEmploye): Promise<Employe> {
    const id = this.currentEmployeId++;
    const now = new Date();
    const employe: Employe = { 
      ...insertEmploye, 
      id, 
      createdAt: now 
    };
    this.employes.set(id, employe);
    return employe;
  }

  async updateEmploye(id: number, employe: Partial<InsertEmploye>): Promise<Employe | undefined> {
    const existingEmploye = this.employes.get(id);
    if (!existingEmploye) return undefined;
    
    const updatedEmploye = { ...existingEmploye, ...employe };
    this.employes.set(id, updatedEmploye);
    return updatedEmploye;
  }

  async deleteEmploye(id: number): Promise<boolean> {
    return this.employes.delete(id);
  }

  async getEmployeePlanning(id: number): Promise<any[]> {
    const employeAffectations = Array.from(this.affectations.values()).filter(
      (affectation) => affectation.employeId === id
    );
    
    const planning = [];
    for (const affectation of employeAffectations) {
      const prestation = this.prestations.get(affectation.prestationId);
      const site = prestation ? this.sites.get(prestation.siteId) : undefined;
      
      if (prestation && site) {
        planning.push({
          prestationId: prestation.id,
          date: prestation.datePrestation,
          heureDebut: prestation.heureDebut,
          heureFin: prestation.heureFin,
          siteNom: site.nomSite,
          siteVille: site.ville,
          statutPrestation: prestation.statutPrestation,
          heuresTravaillees: affectation.heuresTravaillees
        });
      }
    }
    
    return planning;
  }

  // Affectation Methods
  async getAffectationsByPrestation(prestationId: number): Promise<Affectation[]> {
    return Array.from(this.affectations.values()).filter(
      (affectation) => affectation.prestationId === prestationId
    );
  }

  async createAffectation(insertAffectation: InsertAffectation): Promise<Affectation> {
    const id = this.currentAffectationId++;
    const affectation: Affectation = { 
      ...insertAffectation, 
      id
    };
    this.affectations.set(id, affectation);
    return affectation;
  }

  async deleteAffectation(id: number): Promise<boolean> {
    return this.affectations.delete(id);
  }

  // Vehicule Methods
  async getAllVehicules(): Promise<Vehicule[]> {
    return Array.from(this.vehicules.values());
  }

  async getVehicule(id: number): Promise<Vehicule | undefined> {
    return this.vehicules.get(id);
  }

  async createVehicule(insertVehicule: InsertVehicule): Promise<Vehicule> {
    const id = this.currentVehiculeId++;
    const now = new Date();
    const vehicule: Vehicule = { 
      ...insertVehicule, 
      id, 
      createdAt: now 
    };
    this.vehicules.set(id, vehicule);
    return vehicule;
  }

  async updateVehicule(id: number, vehicule: Partial<InsertVehicule>): Promise<Vehicule | undefined> {
    const existingVehicule = this.vehicules.get(id);
    if (!existingVehicule) return undefined;
    
    const updatedVehicule = { ...existingVehicule, ...vehicule };
    this.vehicules.set(id, updatedVehicule);
    return updatedVehicule;
  }

  async deleteVehicule(id: number): Promise<boolean> {
    return this.vehicules.delete(id);
  }

  // Facture Methods
  async getAllFactures(): Promise<Facture[]> {
    return Array.from(this.factures.values());
  }

  async getFacture(id: number): Promise<Facture | undefined> {
    return this.factures.get(id);
  }

  async createFacture(insertFacture: InsertFacture): Promise<Facture> {
    const id = this.currentFactureId++;
    const facture: Facture = { 
      ...insertFacture, 
      id
    };
    this.factures.set(id, facture);
    return facture;
  }

  async updateFacture(id: number, facture: Partial<InsertFacture>): Promise<Facture | undefined> {
    const existingFacture = this.factures.get(id);
    if (!existingFacture) return undefined;
    
    const updatedFacture = { ...existingFacture, ...facture };
    this.factures.set(id, updatedFacture);
    return updatedFacture;
  }

  async updateFacturePaiement(id: number, statut: string): Promise<Facture | undefined> {
    const existingFacture = this.factures.get(id);
    if (!existingFacture) return undefined;
    
    const updatedFacture = { ...existingFacture, statut };
    this.factures.set(id, updatedFacture);
    return updatedFacture;
  }

  async getFactureByPrestation(prestationId: number): Promise<Facture | undefined> {
    return Array.from(this.factures.values()).find(
      (facture) => facture.prestationId === prestationId
    );
  }

  // Dashboard Methods
  async getDashboardKpis(): Promise<any> {
    const allPrestations = Array.from(this.prestations.values());
    const allFactures = Array.from(this.factures.values());
    
    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlySales = allFactures
      .filter(facture => {
        const factureDate = new Date(facture.dateEmission);
        return factureDate.getMonth() === currentMonth && 
               factureDate.getFullYear() === currentYear;
      })
      .reduce((total, facture) => total + Number(facture.montantTtc || 0), 0);
    
    // Count prestations for the month
    const monthlyPrestations = allPrestations
      .filter(prestation => {
        const prestationDate = new Date(prestation.datePrestation);
        return prestationDate.getMonth() === currentMonth && 
               prestationDate.getFullYear() === currentYear;
      })
      .length;
    
    // Calculate payment rate
    const completedPrestations = allPrestations
      .filter(prestation => prestation.statutPrestation === 'termine')
      .length;
    
    const paidPrestations = allPrestations
      .filter(prestation => prestation.statutPaiement === 'paye')
      .length;
    
    const paymentRate = completedPrestations > 0 
      ? Math.round((paidPrestations / completedPrestations) * 100) 
      : 100;
    
    // Count new clients this month
    const newClientsThisMonth = Array.from(this.sites.values())
      .filter(site => {
        const siteDate = new Date(site.createdAt);
        return siteDate.getMonth() === currentMonth && 
               siteDate.getFullYear() === currentYear;
      })
      .length;
    
    return {
      caMensuel: monthlySales || 28450, // Default value if no data
      prestationsMensuel: monthlyPrestations || 42, // Default value if no data
      tauxPaiement: paymentRate || 92, // Default value if no data
      nouveauxClients: newClientsThisMonth || 12 // Default value if no data
    };
  }

  async getDashboardCharts(): Promise<any> {
    // This would contain logic to generate chart data
    // For simplicity, returning mock data that matches the design
    return {
      caEvolution: {
        labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
        data: [12000, 15000, 13500, 18000, 16500, 22000, 25000, 23500, 28000, 32000, 34000, 36000]
      },
      repartitionSites: {
        labels: ["Entreprises", "Particuliers", "Administrations", "Autres"],
        data: [45, 30, 15, 10]
      }
    };
  }

  async getDashboardAlerts(): Promise<any> {
    // This would contain logic to generate alerts
    // For simplicity, returning mock alerts that match the design
    return [
      {
        type: "error",
        message: "3 factures en retard de paiement",
        description: "Depuis plus de 30 jours",
        link: "#"
      },
      {
        type: "warning",
        message: "Véhicule UT-845-ZE en maintenance",
        description: "Retour prévu le 18/10/2023",
        link: "#"
      },
      {
        type: "info",
        message: "Nouveau message de TechPro",
        description: "Question concernant la facture #F-2023-042",
        link: "#"
      },
      {
        type: "success",
        message: "Paiement reçu de Famille Dubois",
        description: "Facture #F-2023-039 de €1,250",
        link: "#"
      }
    ];
  }

  async getPlanningDuJour(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const todayPrestations = Array.from(this.prestations.values())
      .filter(prestation => prestation.datePrestation === today);
    
    const planning = [];
    for (const prestation of todayPrestations) {
      const site = this.sites.get(prestation.siteId);
      
      if (site) {
        planning.push({
          id: prestation.id,
          heure: prestation.heureDebut,
          client: site.nomSite,
          description: `${site.ville} • ${prestation.nbManutentionnaires} manutentionnaires • ${prestation.nbCamions} camion${prestation.nbCamions > 1 ? 's' : ''}`,
          statut: prestation.statutPrestation
        });
      }
    }
    
    return planning;
  }
}

export const storage = new MemStorage();
