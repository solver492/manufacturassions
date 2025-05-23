import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Vehicule } from "@/lib/types";
import { getStatusName, getStatusColor } from "@/lib/utils/formatUtils";
import { Search, Plus, Truck, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

// Define the form schema
const vehiculeSchema = z.object({
  immatriculation: z.string().min(1, "L'immatriculation est requise"),
  typeVehicule: z.string().optional(),
  capacite: z.string().optional(),
  statut: z.string().default("disponible"),
});

type VehiculeFormValues = z.infer<typeof vehiculeSchema>;

const Vehicles = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentVehicule, setCurrentVehicule] = useState<Vehicule | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch vehicles
  const { data: vehicules, isLoading } = useQuery<Vehicule[]>({
    queryKey: ["/api/vehicules"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les véhicules",
        variant: "destructive",
      });
    },
  });

  // Create vehicle mutation
  const createVehiculeMutation = useMutation({
    mutationFn: async (data: VehiculeFormValues) => {
      const res = await apiRequest("POST", "/api/vehicules", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Véhicule créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicules"] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création du véhicule",
        variant: "destructive",
      });
    },
  });

  // Update vehicle mutation
  const updateVehiculeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VehiculeFormValues }) => {
      const res = await apiRequest("PUT", `/api/vehicules/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Véhicule mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicules"] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour du véhicule",
        variant: "destructive",
      });
    },
  });

  // Delete vehicle mutation
  const deleteVehiculeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/vehicules/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Véhicule supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicules"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du véhicule",
        variant: "destructive",
      });
    },
  });

  const form = useForm<VehiculeFormValues>({
    resolver: zodResolver(vehiculeSchema),
    defaultValues: {
      immatriculation: "",
      typeVehicule: "",
      capacite: "",
      statut: "disponible",
    },
  });

  // Reset form and prepare for new vehicle
  const handleNewVehicle = () => {
    form.reset({
      immatriculation: "",
      typeVehicule: "",
      capacite: "",
      statut: "disponible",
    });
    setCurrentVehicule(null);
    setIsDialogOpen(true);
  };

  // Prepare form for editing vehicle
  const handleEditVehicle = (vehicule: Vehicule) => {
    form.reset({
      immatriculation: vehicule.immatriculation,
      typeVehicule: vehicule.typeVehicule || "",
      capacite: vehicule.capacite || "",
      statut: vehicule.statut,
    });
    setCurrentVehicule(vehicule);
    setIsDialogOpen(true);
  };

  // Prepare for vehicle deletion
  const handleDeleteVehicle = (vehicule: Vehicule) => {
    setCurrentVehicule(vehicule);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: VehiculeFormValues) => {
    if (currentVehicule) {
      updateVehiculeMutation.mutate({ id: currentVehicule.id, data });
    } else {
      createVehiculeMutation.mutate(data);
    }
  };

  // Filter vehicles
  const filteredVehicules = vehicules
    ? vehicules.filter((vehicule) => {
        const matchesSearch =
          searchQuery === "" ||
          vehicule.immatriculation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (vehicule.typeVehicule && vehicule.typeVehicule.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === "all" || vehicule.statut === statusFilter;
        const matchesType =
          typeFilter === "all" ||
          (vehicule.typeVehicule && vehicule.typeVehicule.includes(typeFilter));

        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  // Get unique vehicle types for filter
  const uniqueTypes = vehicules
    ? Array.from(
        new Set(
          vehicules
            .map((vehicule) => vehicule.typeVehicule)
            .filter((type): type is string => !!type)
        )
      ).sort()
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredVehicules.length / itemsPerPage);
  const paginatedVehicules = filteredVehicules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get badge styling based on status
  const getStatusBadgeClass = (status: string) => {
    const color = getStatusColor(status);
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800";
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "orange":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Véhicules</h1>
          <Button onClick={handleNewVehicle} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Véhicule
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
                  placeholder="Rechercher un véhicule..."
                />
              </div>
              <div className="flex flex-row gap-2 w-full sm:max-w-md justify-end">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="en_mission">En mission</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                {uniqueTypes.length > 0 && (
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {uniqueTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-5">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : filteredVehicules.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Immatriculation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVehicules.map((vehicule) => (
                    <TableRow key={vehicule.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Truck className="h-5 w-5 mr-2 text-primary" />
                          {vehicule.immatriculation}
                        </div>
                      </TableCell>
                      <TableCell>{vehicule.typeVehicule || "-"}</TableCell>
                      <TableCell>{vehicule.capacite || "-"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(vehicule.statut)}>
                          {getStatusName(vehicule.statut)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditVehicle(vehicule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDeleteVehicle(vehicule)}
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
              <div className="p-8 text-center">
                <Truck className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun véhicule</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                    ? "Aucun véhicule ne correspond à vos critères de recherche."
                    : "Commencez par ajouter un véhicule à votre flotte."}
                </p>
                {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredVehicules.length > itemsPerPage && (
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredVehicules.length)}
                </span>{" "}
                sur <span className="font-medium">{filteredVehicules.length}</span> résultats
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

        {/* Vehicle Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentVehicule ? "Modifier le véhicule" : "Nouveau véhicule"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="immatriculation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Immatriculation *</FormLabel>
                      <FormControl>
                        <Input placeholder="AB-123-CD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="typeVehicule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de véhicule</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Camion 20m³">Camion 20m³</SelectItem>
                          <SelectItem value="Camion 30m³">Camion 30m³</SelectItem>
                          <SelectItem value="Camion 50m³">Camion 50m³</SelectItem>
                          <SelectItem value="Utilitaire 12m³">Utilitaire 12m³</SelectItem>
                          <SelectItem value="Fourgon">Fourgon</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité</FormLabel>
                      <FormControl>
                        <Input placeholder="1500kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="statut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="disponible">Disponible</SelectItem>
                          <SelectItem value="en_mission">En mission</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {currentVehicule ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce véhicule ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Le véhicule{" "}
                <span className="font-semibold">
                  {currentVehicule ? currentVehicule.immatriculation : ""}
                </span>{" "}
                sera définitivement supprimé du système.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => currentVehicule && deleteVehiculeMutation.mutate(currentVehicule.id)}
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

export default Vehicles;
