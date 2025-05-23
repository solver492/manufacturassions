import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Prestation, Site } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/utils/dateUtils";
import { formatCurrency, getStatusName } from "@/lib/utils/formatUtils";
import { Plus, Filter, Eye, Pencil, Trash2, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import PrestationForm from "@/components/prestations/PrestationForm";

const Prestations = () => {
  const { toast } = useToast();
  const [siteFilter, setSiteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPrestation, setSelectedPrestation] = useState<Prestation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch prestations
  const { data: prestations, isLoading: isLoadingPrestations } = useQuery<Prestation[]>({
    queryKey: ["/api/prestations"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les prestations",
        variant: "destructive",
      });
    },
  });

  // Fetch sites for filter and prestation details
  const { data: sites, isLoading: isLoadingSites } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les sites",
        variant: "destructive",
      });
    },
  });

  // Delete prestation mutation
  const deletePrestationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/prestations/${id}`, undefined);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Prestation supprimée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prestations"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression de la prestation",
        variant: "destructive",
      });
    },
  });

  // Update prestation status mutation
  const updatePrestationStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/prestations/${id}`, { statutPrestation: status });
      return res.data;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Statut de la prestation mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prestations"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour du statut de la prestation",
        variant: "destructive",
      });
    },
  });

  // Filter prestations
  const filteredPrestations = prestations
    ? prestations.filter((prestation) => {
        const matchesSite = siteFilter === "all" || prestation.siteId.toString() === siteFilter;
        const matchesStatus = statusFilter === "all" || prestation.statutPrestation === statusFilter;
        return matchesSite && matchesStatus;
      })
    : [];

  // Sort by date (most recent first)
  const sortedPrestations = [...filteredPrestations].sort((a, b) => {
    return new Date(b.datePrestation).getTime() - new Date(a.datePrestation).getTime();
  });

  // Pagination
  const totalPages = Math.ceil(sortedPrestations.length / itemsPerPage);
  const paginatedPrestations = sortedPrestations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle new prestation
  const handleNewPrestation = () => {
    setSelectedPrestation(null);
    setIsFormOpen(true);
  };

  // Handle edit prestation
  const handleEditPrestation = (prestation: Prestation) => {
    setSelectedPrestation(prestation);
    setIsFormOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (prestation: Prestation) => {
    setSelectedPrestation(prestation);
    setIsDeleteDialogOpen(true);
  };

  // Handle detail view
  const handleViewDetails = (prestation: Prestation) => {
    setSelectedPrestation(prestation);
    setIsDetailOpen(true);
  };

  // Handle status update
  const handleStatusUpdate = async (prestation: Prestation, status: string) => {
    try {
      await apiRequest("PATCH", `/api/prestations/${prestation.id}`, {
        statutPrestation: status,
        statutPaiement: prestation.statutPaiement
      });

      // Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ["/api/prestations"] });
      toast({
        title: "Succès",
        description: "Statut de la prestation mis à jour"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  // Get site name by ID
  const getSiteName = (siteId: number) => {
    const site = sites?.find((site) => site.id === siteId);
    return site ? site.nomSite : "Site inconnu";
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "annule":
        return "bg-slate-100 text-slate-800";
      case "termine":
        return "bg-green-100 text-green-800";
      case "en_cours":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Get payment status badge styling
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paye":
        return "bg-green-100 text-green-800";
      case "en_attente":
        return "bg-yellow-100 text-yellow-800";
      case "retard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Prestations</h1>
          <Button onClick={handleNewPrestation} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Prestation
          </Button>
        </div>

        <Card className="shadow">
          <CardHeader className="pb-3">
            <CardTitle>Liste des prestations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px]">
                <Select value={siteFilter} onValueChange={setSiteFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les sites</SelectItem>
                    {sites?.map((site) => (
                      <SelectItem key={site.id} value={site.id.toString()}>
                        {site.nomSite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="planifie">Planifié</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="termine">Terminé</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Plus de filtres
              </Button>
            </div>

            <div className="overflow-x-auto">
              {isLoadingPrestations || isLoadingSites ? (
                <Skeleton className="h-[400px] w-full" />
              ) : paginatedPrestations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Équipe</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Paiement</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPrestations.map((prestation) => (
                      <TableRow key={prestation.id}>
                        <TableCell>
                          <div className="font-medium">{formatDate(prestation.datePrestation)}</div>
                          {prestation.heureDebut && (
                            <div className="text-sm text-slate-500">
                              {formatTime(prestation.heureDebut)} - {formatTime(prestation.heureFin)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{getSiteName(prestation.siteId)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {prestation.nbManutentionnaires} manutentionnaires
                          </div>
                          <div className="text-sm text-slate-500">
                            {prestation.nbCamions} camion{prestation.nbCamions !== 1 ? "s" : ""}
                          </div>
                        </TableCell>
                        <TableCell>
                          {prestation.montantPrevu ? (
                            <div className="font-medium">
                              {formatCurrency(prestation.montantPrevu)}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500">Non défini</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(prestation.statutPrestation)}>
                            {getStatusName(prestation.statutPrestation)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPaymentStatusBadge(prestation.statutPaiement)}>
                            {getStatusName(prestation.statutPaiement)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewDetails(prestation)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPrestation(prestation)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusUpdate(prestation, "termine")}
                              className={prestation.statutPrestation === "termine" ? "text-green-500" : ""}
                              disabled={prestation.statutPrestation === "termine" || prestation.statutPaiement === "paye"}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(prestation)}
                              className="text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <div className="text-slate-500">Aucune prestation trouvée</div>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSiteFilter("all");
                      setStatusFilter("all");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {paginatedPrestations.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-slate-700">
                  Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, filteredPrestations.length)}
                  </span>{" "}
                  sur <span className="font-medium">{filteredPrestations.length}</span> résultats
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
          </CardContent>
        </Card>

        {/* Prestation Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPrestation ? "Modifier la prestation" : "Nouvelle prestation"}
              </DialogTitle>
            </DialogHeader>
            <PrestationForm
              onSuccess={() => setIsFormOpen(false)}
              initialData={selectedPrestation || undefined}
              mode={selectedPrestation ? "edit" : "create"}
            />
          </DialogContent>
        </Dialog>

        {/* Prestation Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la prestation</DialogTitle>
            </DialogHeader>
            {selectedPrestation && sites && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Client</h3>
                    <p className="mt-1 text-base font-medium">
                      {getSiteName(selectedPrestation.siteId)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Date</h3>
                    <p className="mt-1 text-base font-medium">
                      {formatDate(selectedPrestation.datePrestation)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Horaires</h3>
                    <p className="mt-1 text-base font-medium">
                      {selectedPrestation.heureDebut
                        ? `${formatTime(selectedPrestation.heureDebut)} - ${formatTime(
                            selectedPrestation.heureFin
                          )}`
                        : "Non défini"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Équipe</h3>
                    <p className="mt-1 text-base font-medium">
                      {selectedPrestation.nbManutentionnaires} manutentionnaires,{" "}
                      {selectedPrestation.nbCamions} camion
                      {selectedPrestation.nbCamions !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Montant prévu</h3>
                    <p className="mt-1 text-base font-medium">
                      {selectedPrestation.montantPrevu
                        ? formatCurrency(selectedPrestation.montantPrevu)
                        : "Non défini"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Montant facturé</h3>
                    <p className="mt-1 text-base font-medium">
                      {selectedPrestation.montantFacture
                        ? formatCurrency(selectedPrestation.montantFacture)
                        : "Non facturé"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-500">Statut prestation</h3>
                    <Badge className={`mt-1 ${getStatusBadge(selectedPrestation.statutPrestation)}`}>
                      {getStatusName(selectedPrestation.statutPrestation)}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-slate-500">Statut paiement</h3>
                    <Badge
                      className={`mt-1 ${getPaymentStatusBadge(
                        selectedPrestation.statutPaiement
                      )}`}
                    >
                      {getStatusName(selectedPrestation.statutPaiement)}
                    </Badge>
                  </div>
                </div>

                {selectedPrestation.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500">Notes</h3>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">
                      {selectedPrestation.notes}
                    </p>
                  </div>
                )}

                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleEditPrestation(selectedPrestation)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    onClick={() => {
                      const prestation = selectedPrestation;
                      if (prestation) {
                        window.location.href = `/billing#${prestation.id}`;
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Voir la facture
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette prestation ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. La prestation du{" "}
                {selectedPrestation && formatDate(selectedPrestation.datePrestation)} pour{" "}
                {selectedPrestation && getSiteName(selectedPrestation.siteId)} sera définitivement
                supprimée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedPrestation && deletePrestationMutation.mutate(selectedPrestation.id)}
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

export default Prestations;