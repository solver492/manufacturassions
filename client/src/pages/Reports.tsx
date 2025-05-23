import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3, TrendingUp, PieChart, Download, Filter, CalendarRange, ChevronDown,
  Users, Building2, Truck, Receipt
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils/formatUtils";

const COLORS = ["#2563eb", "#4f46e5", "#22c55e", "#ec4899", "#f97316"];

const Reports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ca");
  const [periodFilter, setPeriodFilter] = useState("year");
  const [isExporting, setIsExporting] = useState(false);

  // Récupération des données
  const { data: kpis, isLoading: isLoadingKpis } = useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/kpis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      return response.json();
    }
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/charts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch charts');
      return response.json();
    }
  });

  const { data: sites } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const response = await fetch('/api/sites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch sites');
      return response.json();
    }
  });

  const { data: employes } = useQuery({
    queryKey: ['employes'],
    queryFn: async () => {
      const response = await fetch('/api/employes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch employes');
      return response.json();
    }
  });

  const { data: vehicules } = useQuery({
    queryKey: ['vehicules'],
    queryFn: async () => {
      const response = await fetch('/api/vehicules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch vehicules');
      return response.json();
    }
  });

  // Handle export click
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/dashboard/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Le rapport a été exporté avec succès"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter le rapport",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoadingKpis || isLoadingCharts) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Rapports</h1>
          <div className="flex items-center gap-2">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exportation..." : "Exporter"}
            </Button>
          </div>
        </div>

        <Card className="shadow">
          <CardHeader className="pb-3">
            <CardTitle>Rapports d'activité - {format(new Date(), 'yyyy')}</CardTitle>
            <CardDescription>
              Visualisez les indicateurs clés de performance de votre entreprise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-5 mb-8">
                <TabsTrigger value="ca" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Chiffre d'affaires</span>
                  <span className="sm:hidden">CA</span>
                </TabsTrigger>
                <TabsTrigger value="clients" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Clients</span>
                  <span className="sm:hidden">Clients</span>
                </TabsTrigger>
                <TabsTrigger value="employees" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Employés</span>
                  <span className="sm:hidden">Employés</span>
                </TabsTrigger>
                <TabsTrigger value="vehicles" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <span className="hidden sm:inline">Véhicules</span>
                  <span className="sm:hidden">Véhicules</span>
                </TabsTrigger>
                <TabsTrigger value="finances" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <span className="hidden sm:inline">Finances</span>
                  <span className="sm:hidden">Finances</span>
                </TabsTrigger>
              </TabsList>

              {/* Onglet CA */}
              <TabsContent value="ca">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Évolution du chiffre d'affaires</CardTitle>
                      <CardDescription>
                        Analyse de l'évolution mensuelle du chiffre d'affaires
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            data={charts?.caEvolution?.data.map((value: number, index: number) => ({
                              name: charts.caEvolution.labels[index],
                              value
                            }))} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Bar dataKey="value" fill="#2563eb" name="CA" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>CA par type de client</CardTitle>
                        <CardDescription>
                          Répartition du chiffre d'affaires par type de client
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={charts?.repartitionSites?.data.map((value: number, index: number) => ({
                                  name: charts.repartitionSites.labels[index],
                                  value
                                }))}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {charts?.repartitionSites?.data.map((_: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Indicateurs clés</CardTitle>
                        <CardDescription>
                          Chiffres clés du mois en cours
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">CA Mensuel</p>
                            <p className="text-2xl font-bold">{formatCurrency(kpis?.caMensuel || 0)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Prestations du mois</p>
                            <p className="text-2xl font-bold">{kpis?.prestationsMensuel || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Taux de paiement</p>
                            <p className="text-2xl font-bold">{kpis?.tauxPaiement || 0}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Clients */}
              <TabsContent value="clients">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">{sites?.length || 0}</CardTitle>
                        <CardDescription>Clients actifs</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">{kpis?.nouveauxClients || 0}</CardTitle>
                        <CardDescription>Nouveaux clients</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">92%</CardTitle>
                        <CardDescription>Taux de fidélisation</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Liste des clients</CardTitle>
                      <CardDescription>
                        Vue d'ensemble de tous les clients
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {sites?.map((site: any) => (
                          <div key={site.id} className="flex justify-between items-center p-4 border rounded">
                            <div>
                              <p className="font-medium">{site.nomSite}</p>
                              <p className="text-sm text-gray-500">{site.ville}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{site.contactNom}</p>
                              <p className="text-sm text-gray-500">{site.contactTelephone}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Employés */}
              <TabsContent value="employees">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">{employes?.length || 0}</CardTitle>
                        <CardDescription>Employés actifs</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">94%</CardTitle>
                        <CardDescription>Taux d'occupation</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">{formatCurrency(2450)}</CardTitle>
                        <CardDescription>Coût salarial moyen</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Liste des employés</CardTitle>
                      <CardDescription>
                        Vue d'ensemble de tous les employés
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {employes?.map((employe: any) => (
                          <div key={employe.id} className="flex justify-between items-center p-4 border rounded">
                            <div>
                              <p className="font-medium">{employe.nom} {employe.prenom}</p>
                              <p className="text-sm text-gray-500">{employe.specialite || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{employe.telephone}</p>
                              <p className="text-sm text-gray-500">{formatCurrency(employe.salaireJournalier || 0)} / jour</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Véhicules */}
              <TabsContent value="vehicles">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">{vehicules?.length || 0}</CardTitle>
                        <CardDescription>Véhicules actifs</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">78%</CardTitle>
                        <CardDescription>Taux d'utilisation</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">2</CardTitle>
                        <CardDescription>En maintenance</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Liste des véhicules</CardTitle>
                      <CardDescription>
                        Vue d'ensemble de tous les véhicules
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {vehicules?.map((vehicule: any) => (
                          <div key={vehicule.id} className="flex justify-between items-center p-4 border rounded">
                            <div>
                              <p className="font-medium">{vehicule.immatriculation}</p>
                              <p className="text-sm text-gray-500">{vehicule.typeVehicule}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{vehicule.capacite}</p>
                              <p className={`text-sm ${
                                vehicule.statut === 'disponible' ? 'text-green-500' :
                                vehicule.statut === 'en_mission' ? 'text-blue-500' :
                                'text-red-500'
                              }`}>
                                {vehicule.statut}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Onglet Finances */}
              <TabsContent value="finances">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">{formatCurrency(kpis?.caMensuel || 0)}</CardTitle>
                        <CardDescription>Chiffre d'affaires total</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">{formatCurrency((kpis?.caMensuel || 0) * 0.5)}</CardTitle>
                        <CardDescription>Charges totales</CardDescription>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-3xl font-bold">{formatCurrency((kpis?.caMensuel || 0) * 0.5)}</CardTitle>
                        <CardDescription>Bénéfice net</CardDescription>
                      </CardHeader>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Répartition des dépenses</CardTitle>
                      <CardDescription>
                        Ventilation des coûts par catégorie
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={[
                                { name: "Salaires", value: 60 },
                                { name: "Carburant", value: 15 },
                                { name: "Matériel", value: 10 },
                                { name: "Maintenance", value: 8 },
                                { name: "Autres", value: 7 },
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {[0, 1, 2, 3, 4].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;