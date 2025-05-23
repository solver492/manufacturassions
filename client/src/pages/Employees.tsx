import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Employe } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils/formatUtils";
import { Phone, Plus, User, Calendar, Pencil, Trash2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
const employeSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  telephone: z.string().optional(),
  salaireJournalier: z.string().optional(),
  specialite: z.string().optional(),
  actif: z.boolean().default(true),
});

type EmployeFormValues = z.infer<typeof employeSchema>;

const Employees = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [specialiteFilter, setSpecialiteFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEmploye, setCurrentEmploye] = useState<Employe | null>(null);

  // Fetch employees
  const { data: employes, isLoading } = useQuery<Employe[]>({
    queryKey: ["/api/employes"],
  });

  // Create employee mutation
  const createEmployeMutation = useMutation({
    mutationFn: async (data: EmployeFormValues) => {
      const res = await apiRequest("POST", "/api/employes", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Employé créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employes"] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création de l'employé",
        variant: "destructive",
      });
    },
  });

  // Update employee mutation
  const updateEmployeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: EmployeFormValues }) => {
      const res = await apiRequest("PUT", `/api/employes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Employé mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employes"] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'employé",
        variant: "destructive",
      });
    },
  });

  // Delete employee mutation
  const deleteEmployeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/employes/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Employé supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employes"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression de l'employé",
        variant: "destructive",
      });
    },
  });

  const form = useForm<EmployeFormValues>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      nom: "",
      prenom: "",
      telephone: "",
      salaireJournalier: undefined,
      specialite: "",
      actif: true,
    },
  });

  // Reset form and prepare for new employee
  const handleNewEmployee = () => {
    form.reset({
      nom: "",
      prenom: "",
      telephone: "",
      salaireJournalier: undefined,
      specialite: "",
      actif: true,
    });
    setCurrentEmploye(null);
    setIsDialogOpen(true);
  };

  // Prepare form for editing employee
  const handleEditEmployee = (employe: Employe) => {
    form.reset({
      nom: employe.nom,
      prenom: employe.prenom,
      telephone: employe.telephone || "",
      salaireJournalier: employe.salaireJournalier ? employe.salaireJournalier.toString() : "",
      specialite: employe.specialite || "",
      actif: employe.actif,
    });
    setCurrentEmploye(employe);
    setIsDialogOpen(true);
  };

  // Prepare for employee deletion
  const handleDeleteEmployee = (employe: Employe) => {
    setCurrentEmploye(employe);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: EmployeFormValues) => {
    if (currentEmploye) {
      updateEmployeMutation.mutate({ id: currentEmploye.id, data });
    } else {
      createEmployeMutation.mutate(data);
    }
  };

  // Filter employees
  const filteredEmployes = employes
    ? employes.filter((employe) => {
        const matchesSearch =
          searchQuery === "" ||
          `${employe.nom} ${employe.prenom}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (employe.telephone && employe.telephone.includes(searchQuery));

        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "active" && employe.actif) ||
          (statusFilter === "inactive" && !employe.actif);

        const matchesSpecialite = specialiteFilter === "all" || 
          (employe.specialite && employe.specialite === specialiteFilter);

        return matchesSearch && matchesStatus && matchesSpecialite;
      })
    : [];

  // Get unique specialties for filter
  const uniqueSpecialites = employes
    ? Array.from(
        new Set(
          employes
            .map((employe) => employe.specialite)
            .filter((specialite): specialite is string => !!specialite)
        )
      ).sort()
    : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Employés</h1>
          <Button onClick={handleNewEmployee} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvel Employé
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
                  placeholder="Rechercher un employé..."
                />
              </div>
              <div className="flex flex-row gap-2 w-full sm:max-w-md justify-end">
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
                {uniqueSpecialites.length > 0 && (
                  <Select value={specialiteFilter} onValueChange={setSpecialiteFilter}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="Toutes spécialités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes spécialités</SelectItem>
                      {uniqueSpecialites.map((specialite) => (
                        <SelectItem key={specialite} value={specialite}>
                          {specialite}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-[220px] w-full" />
                ))}
            </div>
          ) : filteredEmployes.length > 0 ? (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredEmployes.map((employe) => (
                <Card key={employe.id} className={employe.actif ? "" : "opacity-60"}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {employe.prenom} {employe.nom}
                          </CardTitle>
                          <CardDescription>{employe.specialite || "Manutentionnaire"}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={employe.actif ? "default" : "outline"} className="ml-2">
                        {employe.actif ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      {employe.telephone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-slate-400" />
                          <span>{employe.telephone}</span>
                        </div>
                      )}
                      {employe.salaireJournalier !== null && employe.salaireJournalier !== undefined && (
                        <div className="flex items-center">
                          <span className="text-slate-600 mr-2">Salaire journalier:</span>
                          <span className="font-medium">
                            {formatCurrency(employe.salaireJournalier)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Planning
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEmployee(employe)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteEmployee(employe)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-5 text-center">
              <p className="text-slate-500">
                {searchQuery || statusFilter !== "all" || specialiteFilter !== "all"
                  ? "Aucun employé ne correspond à vos critères de recherche."
                  : "Aucun employé enregistré. Ajoutez votre premier employé."}
              </p>
              {(searchQuery || statusFilter !== "all" || specialiteFilter !== "all") && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSpecialiteFilter("all");
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Employee Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {currentEmploye ? "Modifier l'employé" : "Nouvel employé"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom *</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="telephone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="0612345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salaireJournalier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salaire journalier (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="100.00"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spécialité</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Chef d'équipe">Chef d'équipe</SelectItem>
                            <SelectItem value="Manutentionnaire">Manutentionnaire</SelectItem>
                            <SelectItem value="Chauffeur">Chauffeur</SelectItem>
                            <SelectItem value="Technicien">Technicien</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="actif"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Employé actif</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                    {currentEmploye ? "Mettre à jour" : "Ajouter"}
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
              <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet employé ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. L'employé{" "}
                <span className="font-semibold">
                  {currentEmploye ? `${currentEmploye.prenom} ${currentEmploye.nom}` : ""}
                </span>{" "}
                sera définitivement supprimé du système.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => currentEmploye && deleteEmployeMutation.mutate(currentEmploye.id)}
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

export default Employees;
