// Generic API response type
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

// Dashboard types
export interface DashboardKPI {
  caMensuel: number;
  prestationsMensuel: number;
  tauxPaiement: number;
  nouveauxClients: number;
}

export interface ChartData {
  caEvolution: {
    labels: string[];
    data: number[];
  };
  repartitionSites: {
    labels: string[];
    data: number[];
  };
}

export interface Alert {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  description: string;
  link: string;
}

export interface PlanningItem {
  id: number;
  heure: string;
  client: string;
  description: string;
  statut: string;
}

// Site types
export interface Site {
  id: number;
  nomSite: string;
  ville: string;
  adresse: string;
  contactNom?: string;
  contactTelephone?: string;
  contactEmail?: string;
  tarifHoraire?: number;
  notes?: string;
  actif: boolean;
  createdAt: Date;
}

// Prestation types
export interface Prestation {
  id: number;
  siteId: number;
  datePrestation: string;
  heureDebut?: string;
  heureFin?: string;
  nbManutentionnaires: number;
  nbCamions: number;
  montantPrevu?: number;
  montantFacture?: number;
  statutPaiement: 'en_attente' | 'paye' | 'retard';
  statutPrestation: 'planifie' | 'en_cours' | 'termine' | 'annule';
  notes?: string;
  createdAt: Date;
}

export interface CalendarEvent extends Prestation {
  siteName: string;
  color: string;
}

// Employee types
export interface Employe {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  salaireJournalier?: number;
  specialite?: string;
  actif: boolean;
  createdAt: Date;
}

// Vehicle types
export interface Vehicule {
  id: number;
  immatriculation: string;
  typeVehicule?: string;
  capacite?: string;
  statut: 'disponible' | 'en_mission' | 'maintenance';
  createdAt: Date;
}

// Invoice types
export interface Facture {
  id: number;
  prestationId: number;
  numeroFacture: string;
  dateEmission: string;
  dateEcheance?: string;
  montantHt?: number;
  tva?: number;
  montantTtc?: number;
  statut: 'brouillon' | 'envoyee' | 'payee' | 'en_retard';
  fichierPdf?: string;
}
