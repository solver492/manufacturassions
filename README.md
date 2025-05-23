# Mon Auxiliaire Déménagement - Documentation Complète

## 🎯 Vue d'ensemble

Application web complète de gestion d'entreprise de déménagement permettant la planification, le suivi et la facturation des prestations avec une interface moderne et intuitive.

## 🚦 État Actuel du Projet

### ✅ Fonctionnalités Opérationnelles
1. Authentification et gestion des utilisateurs
2. Interface utilisateur responsive
3. Gestion des sites clients
4. Calendrier des prestations
5. Génération de factures
6. Dashboard avec KPIs

### 🔧 Problèmes en Cours
1. Synchronisation des statuts de prestation avec les paiements
2. Performance du calendrier avec beaucoup d'événements
3. Gestion des dates d'échéance pour les factures
4. Optimisation des requêtes API

### 📋 Prochaines Étapes
1. Amélioration de la gestion des statuts
2. Implémentation des relances automatiques
3. Optimisation des performances
4. Ajout de rapports détaillés

## 🔧 Architecture Technique

### Frontend
- **React.js** avec TypeScript
- **Tailwind CSS** pour le design responsive
- **FullCalendar** pour la visualisation calendaire
- **Recharts** pour les graphiques du dashboard
- **React Router** pour la navigation
- **Axios** pour les requêtes API
- **shadcn/ui** pour les composants UI

### Backend
- **Node.js** avec **Express.js**
- **SQLite** avec **Drizzle ORM**
- **JWT** pour l'authentification
- **Multer** pour la gestion des fichiers
- **PDFKit** pour génération de factures

## 📱 Fonctionnalités Principales

### 1. Authentification
- Login sécurisé avec JWT
- Gestion des sessions
- Récupération de mot de passe
- Rôles : admin, gestionnaire, employé

### 2. Dashboard
- KPIs principaux (CA mensuel, prestations, paiements)
- Graphiques de performance
- Alertes et notifications
- Météo des paiements

### 3. Gestion des Sites Clients
- CRUD complet des sites
- Historique des prestations
- Statistiques par client
- Filtrage et recherche

### 4. Planification des Prestations
- Création/modification des prestations
- Affectation des employés
- Gestion des véhicules
- Calcul automatique des coûts

### 5. Calendrier
- Vue mensuelle/hebdomadaire/journalière
- Drag & Drop des prestations
- Code couleur par statut
- Détails rapides des prestations

### 6. Facturation
- Génération automatique des factures
- Suivi des paiements
- États des paiements synchronisés
- Export PDF

## 🔄 Workflow des Statuts

### Statuts de Prestation
1. **Planifié** - Prestation programmée
2. **En cours** - Prestation en cours d'exécution
3. **Terminé** - Prestation effectuée
4. **Annulé** - Prestation annulée

### Statuts de Paiement
1. **En attente** - Facture créée
2. **Payé** - Paiement reçu
3. **Retard** - Paiement en retard

## 🔍 Tests et Qualité

### Tests Unitaires
- Composants React
- Routes API
- Utilitaires

### Tests d'Intégration
- Flux de paiement
- Création de prestation
- Génération de factures

## 📈 Monitoring

### Performances
- Temps de réponse API
- Charge serveur
- Utilisation mémoire

### Sécurité
- Logs d'authentification
- Tentatives d'accès
- Activité utilisateurs

## 🚀 Déploiement

### Configuration Production
- Build optimisé
- Compression des assets
- Cache des requêtes
- SSL/TLS

## 📝 Guidelines Développement

### Code
- TypeScript strict
- ESLint config
- Prettier formatting
- Conventional commits

### Base de Données
- Migrations versionées
- Backups automatiques
- Indexes optimisés

### Documentation
- API documentation
- Guides utilisateur
- Changelog

## 🆘 Support

### Canaux
- Documentation en ligne
- Support technique
- Formation utilisateur

### Maintenance
- Mises à jour régulières
- Correctifs de sécurité
- Optimisations continues

# Mon Auxiliaire Déménagement - Documentation Complète

## 🎯 Vue d'ensemble

Application web complète de gestion d'entreprise de déménagement permettant la planification, le suivi et la facturation des prestations avec une interface moderne et intuitive.

## 🔧 Architecture Technique

### Frontend
- **React.js** avec TypeScript
- **Tailwind CSS** pour le design responsive
- **FullCalendar** pour la visualisation calendaire
- **Recharts** pour les graphiques du dashboard
- **React Router** pour la navigation
- **Axios** pour les requêtes API
- **shadcn/ui** pour les composants UI

### Backend
- **Node.js** avec **Express.js**
- **SQLite** avec **Drizzle ORM**
- **JWT** pour l'authentification
- **Multer** pour la gestion des fichiers
- **PDFKit** pour génération de factures

## 📱 Fonctionnalités Principales

### 1. Authentification
- Login sécurisé avec JWT
- Gestion des sessions
- Récupération de mot de passe
- Rôles : admin, gestionnaire, employé

### 2. Dashboard
- KPIs principaux (CA mensuel, prestations, paiements)
- Graphiques de performance
- Alertes et notifications
- Météo des paiements

### 3. Gestion des Sites Clients
- CRUD complet des sites
- Historique des prestations
- Statistiques par client
- Filtrage et recherche

### 4. Planification des Prestations
- Création/modification des prestations
- Affectation des employés
- Gestion des véhicules
- Calcul automatique des coûts

### 5. Calendrier
- Vue mensuelle/hebdomadaire/journalière
- Drag & Drop des prestations
- Code couleur par statut
- Détails rapides des prestations

### 6. Gestion des Employés
- Profils et compétences
- Planning individuel
- Suivi des heures
- Calcul des salaires

### 7. Facturation
- Génération automatique des factures
- Suivi des paiements
- Relances automatiques
- Export PDF

## 💾 Structure de la Base de Données

### Tables Principales
- **users**: Gestion des utilisateurs
- **sites**: Sites clients
- **prestations**: Missions de déménagement
- **employes**: Personnel
- **vehicules**: Flotte de véhicules
- **factures**: Facturation
- **affectations**: Liaison employés-prestations

## 🚀 Installation et Démarrage

1. **Installation des dépendances**
```bash
npm install
```

2. **Démarrage en développement**
```bash
npm run dev
```

3. **Build production**
```bash
npm run build
```

## 📁 Structure du Projet

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── context/      # Contextes React
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── lib/          # Utilitaires
│   │   └── pages/        # Pages de l'application
├── server/                # Backend Express
│   ├── routes.ts         # Routes API
│   └── storage.ts        # Logique base de données
└── shared/               # Code partagé
    └── schema.ts         # Schémas de données
```

## 🔒 Sécurité

- Chiffrement des mots de passe (bcrypt)
- Protection CSRF
- Validation des données
- Authentification JWT
- Sessions sécurisées

## 📱 Responsive Design

- Interface adaptative (mobile, tablette, desktop)
- Touch-friendly
- Mode sombre
- PWA ready

## 🛠 API Endpoints

### Authentication
- POST `/api/auth/login`
- POST `/api/auth/logout`
- GET `/api/auth/profile`

### Sites
- GET `/api/sites`
- POST `/api/sites`
- PUT `/api/sites/:id`
- DELETE `/api/sites/:id`

### Prestations
- GET `/api/prestations`
- POST `/api/prestations`
- PUT `/api/prestations/:id`
- GET `/api/prestations/calendar`

### Facturation
- GET `/api/factures`
- POST `/api/factures`
- GET `/api/factures/:id/pdf`

## 👥 Rôles Utilisateurs

### Admin
- Accès complet
- Gestion des utilisateurs
- Configuration système

### Gestionnaire
- Gestion des prestations
- Facturation
- Rapports

### Employé
- Vue planning
- Mise à jour statuts
- Rapports d'intervention

## 📊 Rapports et Analytics

- CA par période
- Performance équipes
- Taux d'occupation
- Rentabilité clients
- Export données

## 🔄 Workflow Quotidien

1. **Matin**
   - Consultation planning du jour
   - Vérification disponibilités
   - Affectation équipes

2. **Journée**
   - Suivi prestations en cours
   - Gestion imprévus
   - Mise à jour statuts

3. **Soir**
   - Bilan journée
   - Facturation
   - Planification lendemain

## 💡 Bonnes Pratiques

- Mise à jour régulière des statuts
- Vérification des disponibilités
- Documentation des interventions
- Suivi rigoureux des paiements

## 🆘 Support

Pour toute question ou assistance :
- Consulter la documentation technique
- Contacter l'administrateur système
- Utiliser le système de tickets internes

## 🔄 Mises à jour

L'application est régulièrement mise à jour pour :
- Corrections de bugs
- Nouvelles fonctionnalités
- Améliorations performances
- Mises à jour sécurité

## 📝 Notes Développeurs

- Utiliser TypeScript strict
- Suivre les conventions de code
- Documenter les changements
- Tester avant déploiement

## 🎯 Roadmap

1. **Phase 1 (Base)**
   - Authentification
   - CRUD basique
   - Interface principale

2. **Phase 2 (Avancé)**
   - Facturation automatique
   - Rapports détaillés
   - Intégrations externes

3. **Phase 3 (Optimisation)**
   - Performance
   - UX améliorée
   - Analytics avancés
