
// Number formatting utilities
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return '€0,00';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (num: number | null | undefined, decimals: number = 0): string => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

export const formatPercent = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0%';
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(value / 100);
};

// Status formatting utilities
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'planifie':
      return 'blue';
    case 'en_cours':
      return 'green';
    case 'termine':
      return 'green';
    case 'annule':
      return 'gray';
    case 'en_attente':
      return 'orange';
    case 'paye':
      return 'green';
    case 'retard':
      return 'red';
    case 'brouillon':
      return 'gray';
    case 'envoyee':
      return 'blue';
    case 'en_retard':
      return 'red';
    case 'disponible':
      return 'green';
    case 'en_mission':
      return 'blue';
    case 'maintenance':
      return 'orange';
    default:
      return 'gray';
  }
};

export function getStatusPaiement(statutPrestation: string, statutPaiement: string, dateEcheance?: string) {
  if (statutPrestation === "annule") return "cancelled";
  if (statutPaiement === "paye") return "paid";
  if (statutPaiement === "retard" || (dateEcheance && new Date(dateEcheance) < new Date())) return "late";
  if (statutPrestation === "termine" && statutPaiement === "en_attente") return "pending";
  return "unpaid";
}

export function syncStatutPrestationPaiement(statutPrestation: string, statutPaiement: string): { 
  newStatutPrestation: string, 
  newStatutPaiement: string 
} {
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

export function getStatusName(status: string) {
  switch (status) {
    case "planifie":
      return "Planifié";
    case "en_cours":
      return "En cours";
    case "termine":
      return "Terminé";
    case "annule":
      return "Annulé";
    case "paye":
      return "Payé";
    case "en_attente":
      return "En attente";
    case "retard":
      return "En retard";
    case "paid":
      return "Terminé et payé";
    case "unpaid":
      return "Terminé, paiement en attente";
    case "late":
      return "En retard de paiement";
    case "pending":
      return "En cours";
    case "cancelled":
      return "Annulé";
    default:
      return status;
  }
}

export const getInitials = (name: string): string => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return name.substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
