import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Facture, Prestation, Site } from "@/lib/types";
import { formatDate } from "@/lib/utils/dateUtils";
import { formatCurrency, getStatusName, getStatusColor } from "@/lib/utils/formatUtils";
import {
  FileText,
  Plus,
  Search,
  Download,
  Mail,
  Check,
  Clock,
  AlertTriangle,
  Filter,
  ChevronDown,
} from "lucide-react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Define the form schema
const factureSchema = z.object({
  prestationId: z.coerce.number().min(1, "La prestation est requise"),
  numeroFacture: z.string().min(1, "Le numéro de facture est requis"),
  dateEmission: z.string().min(1, "La date d'émission est requise"),
  dateEcheance: z.string().optional(),
  montantHt: z.coerce.number().min(0, "Le montant HT ne peut pas être négatif"),
  tva: z.coerce.number().min(0, "La TVA ne peut pas être négative"),
  montantTtc: z.coerce.number().min(0, "Le montant TTC ne peut pas être négatif"),
  statut: z.string().default("brouillon"),
});

type FactureFormValues = z.infer<typeof factureSchema>;

const Billing = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("toutes");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch factures
  const { data: factures, isLoading: isLoadingFactures } = useQuery<Facture[]>({
    queryKey: ["/api/factures"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les factures",
        variant: "destructive",
      });
    },
  });

  // Fetch prestations for dropdown
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

  // Fetch sites for reference
  const { data: sites } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les sites",
        variant: "destructive",
      });
    },
  });

  // Create facture mutation
  const createFactureMutation = useMutation({
    mutationFn: async (data: FactureFormValues) => {
      // Convertir les montants en chaînes de caractères pour correspondre aux attentes du serveur
      const formattedData = {
        ...data,
        montantHt: data.montantHt.toString(),
        tva: data.tva.toString(),
        montantTtc: data.montantTtc.toString()
      };
      const res = await apiRequest("POST", "/api/factures", formattedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/factures"] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création de la facture",
        variant: "destructive",
      });
    },
  });

  // Update facture payment status
  const updateFacturePaiementMutation = useMutation({
    mutationFn: async ({ id, statut }: { id: number; statut: string }) => {
      const res = await apiRequest("PUT", `/api/factures/${id}/paiement`, { statut });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Statut de la facture mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/factures"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour du statut",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FactureFormValues>({
    resolver: zodResolver(factureSchema),
    defaultValues: {
      prestationId: 0,
      numeroFacture: "",
      dateEmission: new Date().toISOString().split("T")[0],
      dateEcheance: "",
      montantHt: 0,
      tva: 0,
      montantTtc: 0,
      statut: "brouillon",
    },
  });

  // Watch for montantHt and tva changes to calculate montantTtc
  const montantHt = form.watch("montantHt");
  const tva = form.watch("tva");

  // Update montantTtc when montantHt or tva changes
  const updateMontantTtc = () => {
    if (montantHt && tva) {
      const montantTtc = montantHt + tva;
      form.setValue("montantTtc", montantTtc);
    }
  };

  // Reset form and prepare for new facture
  const handleNewFacture = () => {
    form.reset({
      prestationId: 0,
      numeroFacture: `F-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      dateEmission: new Date().toISOString().split("T")[0],
      dateEcheance: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
      montantHt: 0,
      tva: 0,
      montantTtc: 0,
      statut: "brouillon",
    });
    setSelectedFacture(null);
    setIsDialogOpen(true);
  };

  // Handle prestation selection in form to auto-populate montant values
  const handlePrestationChange = (prestationId: string) => {
    const selectedPrestation = prestations?.find(p => p.id === parseInt(prestationId));
    if (selectedPrestation && selectedPrestation.montantPrevu) {
      const montantHt = selectedPrestation.montantPrevu;
      const tva = montantHt * 0.2; // 20% TVA
      form.setValue("montantHt", montantHt);
      form.setValue("tva", tva);
      form.setValue("montantTtc", montantHt + tva);
    }
  };

  // Mark facture as paid
  const markAsPaid = (facture: Facture) => {
    updateFacturePaiementMutation.mutate({ id: facture.id, statut: "payee" });
  };

  // Handle download PDF
  const handleDownloadPdf = async (factureId: number) => {
    try {
      const response = await fetch(`/api/factures/${factureId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${factureId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le PDF. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  // Handle sending email
  const handleSendEmail = (facture: Facture) => {
    toast({
      title: "Information",
      description: "L'envoi par email sera disponible dans la prochaine version",
    });
    // Update status to sent
    updateFacturePaiementMutation.mutate({ id: facture.id, statut: "envoyee" });
  };

  // Handle form submission
  const onSubmit = (data: FactureFormValues) => {
    createFactureMutation.mutate(data);
  };

  // Get site name and client information for a prestation
  const getSiteInfo = (prestationId: number) => {
    const prestation = prestations?.find(p => p.id === prestationId);
    if (!prestation) return { siteName: "Inconnu", date: "" };

    const site = sites?.find(s => s.id === prestation.siteId);
    return {
      siteName: site?.nomSite || "Site inconnu",
      date: formatDate(prestation.datePrestation),
    };
  };

  // Filter and sort factures based on active tab, search and filters
  const filterFactures = (factures: Facture[] | undefined) => {
    if (!factures) return [];

    return factures.filter(facture => {
      // Filter by tab
      if (activeTab === "brouillons" && facture.statut !== "brouillon") return false;
      if (activeTab === "envoyees" && facture.statut !== "envoyee") return false;
      if (activeTab === "payees" && facture.statut !== "payee") return false;
      if (activeTab === "retard" && facture.statut !== "en_retard") return false;

      // Filter by search
      if (searchQuery) {
        const siteInfo = getSiteInfo(facture.prestationId);
        const searchLower = searchQuery.toLowerCase();
        if (
          !facture.numeroFacture.toLowerCase().includes(searchLower) &&
          !siteInfo.siteName.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Filter by status
      if (statusFilter !== "all" && facture.statut !== statusFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort by date, newest first
      return new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime();
    });
  };

  const filteredFactures = filterFactures(factures);

  // Pagination
  const totalPages = Math.ceil(filteredFactures.length / itemsPerPage);
  const paginatedFactures = filteredFactures.slice(
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
      case "red":
        return "bg-red-100 text-red-800";
      case "gray":
        return "bg-slate-100 text-slate-800";
      case "orange":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Count factures by status
  const getStatusCounts = (factures: Facture[] | undefined) => {
    if (!factures) return { all: 0, brouillon: 0, envoyee: 0, payee: 0, en_retard: 0 };

    return factures.reduce(
      (acc, facture) => {
        acc.all++;
        acc[facture.statut as keyof typeof acc]++;
        return acc;
      },
      { all: 0, brouillon: 0, envoyee: 0, payee: 0, en_retard: 0 }
    );
  };

  const statusCounts = getStatusCounts(factures);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Facturation</h1>
          <Button onClick={handleNewFacture} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>

        <Card className="shadow">
          <CardHeader className="pb-3">
            <CardTitle>Gestion des factures</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-8">
                <TabsTrigger value="toutes" className="relative">
                  Toutes
                  <Badge className="ml-1.5 bg-slate-100 text-slate-800 hover:bg-slate-100">{statusCounts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="brouillons">
                  Brouillons
                  <Badge className="ml-1.5 bg-slate-100 text-slate-800 hover:bg-slate-100">{statusCounts.brouillon}</Badge>
                </TabsTrigger>
                <TabsTrigger value="envoyees">
                  Envoyées
                  <Badge className="ml-1.5 bg-blue-100 text-blue-800 hover:bg-blue-100">{statusCounts.envoyee}</Badge>
                </TabsTrigger>
                <TabsTrigger value="payees">
                  Payées
                  <Badge className="ml-1.5 bg-green-100 text-green-800 hover:bg-green-100">{statusCounts.payee}</Badge>
                </TabsTrigger>
                <TabsTrigger value="retard">
                  En retard
                  <Badge className="ml-1.5 bg-red-100 text-red-800 hover:bg-red-100">{statusCounts.en_retard}</Badge>
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative rounded-md shadow-sm max-w-xs flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    placeholder="Rechercher une facture..."
                  />
                </div>
                <div className="flex-1 min-w-[200px] max-w-xs">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="brouillon">Brouillons</SelectItem>
                      <SelectItem value="envoyee">Envoyées</SelectItem>
                      <SelectItem value="payee">Payées</SelectItem>
                      <SelectItem value="en_retard">En retard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Autres filtres</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              <TabsContent value={activeTab} className="mt-0">
                <div className="overflow-x-auto">
                  {isLoadingFactures ? (
                    <Skeleton className="h-[400px] w-full" />
                  ) : paginatedFactures.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>N° Facture</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Échéance</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedFactures.map((facture) => {
                          const siteInfo = getSiteInfo(facture.prestationId);
                          return (
                            <TableRow key={facture.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <FileText className="h-5 w-5 mr-2 text-primary" />
                                  {facture.numeroFacture}
                                </div>
                              </TableCell>
                              <TableCell>{siteInfo.siteName}</TableCell>
                              <TableCell>{formatDate(facture.dateEmission)}</TableCell>
                              <TableCell>
                                {facture.dateEcheance ? formatDate(facture.dateEcheance) : "-"}
                              </TableCell>
                              <TableCell>
                                {facture.montantTtc ? formatCurrency(facture.montantTtc) : "-"}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeClass(facture.statut)}>
                                  {getStatusName(facture.statut)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDownloadPdf(facture.id)}
                                    title="Télécharger PDF"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  {facture.statut === "brouillon" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleSendEmail(facture)}
                                      title="Envoyer par email"
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {facture.statut === "envoyee" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => markAsPaid(facture)}
                                      title="Marquer comme payée"
                                      className="text-green-500"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {facture.statut === "en_retard" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      title="Relance en retard"
                                      className="text-red-500"
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10">
                      <FileText className="mx-auto h-12 w-12 text-slate-400" />
                      <h3 className="mt-2 text-sm font-medium text-slate-900">Aucune facture</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {searchQuery || statusFilter !== "all"
                          ? "Aucune facture ne correspond à vos critères de recherche."
                          : `Vous n'avez pas encore de facture${activeTab !== "toutes" ? " dans cette catégorie" : ""}.`}
                      </p>
                      {(searchQuery || statusFilter !== "all") && (
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}
                        >
                          Réinitialiser les filtres
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {filteredFactures.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-slate-700">
                      Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, filteredFactures.length)}
                      </span>{" "}
                      sur <span className="font-medium">{filteredFactures.length}</span> résultats
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Facture Form Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle facture</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="prestationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prestation associée *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handlePrestationChange(value);
                        }}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une prestation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prestations?.map((prestation) => {
                            const siteInfo = getSiteInfo(prestation.id);
                            return (
                              <SelectItem key={prestation.id} value={prestation.id.toString()}>
                                {siteInfo.siteName} - {siteInfo.date}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroFacture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de facture *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateEmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'émission *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateEcheance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'échéance</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="montantHt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant HT (€) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setTimeout(updateMontantTtc, 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TVA (€) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setTimeout(updateMontantTtc, 0);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="montantTtc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant TTC (€) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} readOnly />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="statut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut initial</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="brouillon">Brouillon</SelectItem>
                          <SelectItem value="envoyee">Envoyée</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">Créer la facture</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Billing;