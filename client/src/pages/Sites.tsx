import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Site } from "@/lib/types";
import { getInitials } from "@/lib/utils/formatUtils";
import { formatCurrency } from "@/lib/utils/formatUtils";
import { 
  Search, 
  Plus, 
  Eye, 
  Pencil, 
  Trash2,
  Check,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import SiteModal from "@/components/sites/SiteModal";

const Sites = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [villeFilter, setVilleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | undefined>(undefined);
  const [deletingSite, setDeletingSite] = useState<Site | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch sites
  const { data: sites, isLoading } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les sites clients",
        variant: "destructive",
      });
    },
  });

  // Delete site mutation
  const deleteSiteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/sites/${id}`, undefined);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Site supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du site",
        variant: "destructive",
      });
    },
  });

  // Filter and sort sites
  const filteredSites = sites
    ? sites.filter((site) => {
        const matchesSearch =
          searchQuery === "" ||
          site.nomSite.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (site.contactNom && site.contactNom.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesVille = villeFilter === "all" || site.ville === villeFilter;
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "active" && site.actif) || 
          (statusFilter === "inactive" && !site.actif);

        return matchesSearch && matchesVille && matchesStatus;
      })
    : [];

  // Get unique villes for filter
  const uniqueVilles = sites
    ? Array.from(new Set(sites.map((site) => site.ville))).sort()
    : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredSites.length / itemsPerPage);
  const paginatedSites = filteredSites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Open modal for creating new site
  const handleNewSite = () => {
    setEditingSite(undefined);
    setModalOpen(true);
  };

  // Open modal for editing site
  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setModalOpen(true);
  };

  // Open dialog for deleting site
  const handleDeleteClick = (site: Site) => {
    setDeletingSite(site);
    setDeleteDialogOpen(true);
  };

  // Confirm site deletion
  const confirmDelete = () => {
    if (deletingSite) {
      deleteSiteMutation.mutate(deletingSite.id);
      setDeleteDialogOpen(false);
      setDeletingSite(undefined);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setVilleFilter("all");
    setStatusFilter("all");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Sites Clients</h1>
          <Button onClick={handleNewSite} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Site
          </Button>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0 gap-3">
              <div className="relative rounded-md shadow-sm w-full sm:max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  placeholder="Rechercher un site..."
                />
              </div>
              <div className="flex flex-row gap-2 w-full sm:max-w-md justify-end">
                <Select value={villeFilter} onValueChange={setVilleFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Toutes les villes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les villes</SelectItem>
                    {uniqueVilles.map((ville) => (
                      <SelectItem key={ville} value={ville}>
                        {ville}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Tarif Horaire</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSites.length > 0 ? (
                    paginatedSites.map((site) => (
                      <TableRow key={site.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                              {getInitials(site.nomSite)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{site.nomSite}</div>
                              <div className="text-sm text-slate-500 truncate max-w-[200px]">
                                {site.adresse}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-900">{site.ville}</div>
                        </TableCell>
                        <TableCell>
                          {site.contactNom ? (
                            <>
                              <div className="text-sm text-slate-900">{site.contactNom}</div>
                              <div className="text-sm text-slate-500">
                                {site.contactEmail || ""}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">Non spécifié</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-900">
                          {site.tarifHoraire ? formatCurrency(site.tarifHoraire) : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={site.actif ? "default" : "secondary"}
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              site.actif
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {site.actif ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="text-primary">
                              <Eye className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-secondary"
                              onClick={() => handleEditSite(site)}
                            >
                              <Pencil className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              onClick={() => handleDeleteClick(site)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        Aucun résultat trouvé
                        {(searchQuery || villeFilter !== "all" || statusFilter !== "all") && (
                          <div className="mt-2">
                            <Button variant="outline" size="sm" onClick={resetFilters}>
                              Réinitialiser les filtres
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {filteredSites.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredSites.length)}
                </span>{" "}
                sur <span className="font-medium">{filteredSites.length}</span> résultats
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Site Modal */}
        <SiteModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          site={editingSite}
          mode={editingSite ? "edit" : "create"}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce site ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Le site{" "}
                <span className="font-semibold">{deletingSite?.nomSite}</span> sera définitivement
                supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Sites;
