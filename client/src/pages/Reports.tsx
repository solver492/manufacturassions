import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  Filter,
  CalendarRange,
  ChevronDown,
  Users,
  Building2,
  Truck,
  Receipt,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
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

// Example data since we don't have specific report API endpoints
const getCAMonthlyData = () => {
  const now = new Date();
  const data = [];
  
  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    const month = format(date, 'MMM', { locale: fr });
    
    // Generate some random data that looks realistic with a trend
    const baseValue = 15000 + Math.floor(Math.random() * 5000);
    const monthValue = baseValue + (i * 1000); // Increasing trend
    
    data.push({
      name: month,
      ca: monthValue
    });
  }
  
  return data;
};

const getCAByClientData = () => [
  { name: "Entreprises", value: 45 },
  { name: "Particuliers", value: 30 },
  { name: "Administrations", value: 15 },
  { name: "Autres", value: 10 },
];

const getEmployeePerformanceData = () => [
  { name: "Dupont T.", completed: 28, canceled: 1 },
  { name: "Martin J.", completed: 25, canceled: 0 },
  { name: "Dubois S.", completed: 22, canceled: 2 },
  { name: "Lambert L.", completed: 20, canceled: 1 },
  { name: "Bernard M.", completed: 18, canceled: 3 },
];

const getVehicleUtilizationData = () => [
  { name: "AB-123-CD", utilization: 85 },
  { name: "EF-456-GH", utilization: 75 },
  { name: "IJ-789-KL", utilization: 90 },
  { name: "MN-012-OP", utilization: 60 },
  { name: "QR-345-ST", utilization: 70 },
];

const getMonthlyCostsData = () => {
  const caData = getCAMonthlyData();
  return caData.map(item => ({
    name: item.name,
    ca: item.ca,
    costs: item.ca * (0.4 + Math.random() * 0.2), // Costs around 40-60% of revenue
    profit: item.ca * (0.4 + Math.random() * 0.2), // Remaining is profit
  }));
};

const COLORS = ["#2563eb", "#4f46e5", "#22c55e", "#ec4899", "#f97316"];

const Reports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("ca");
  const [periodFilter, setPeriodFilter] = useState("year");
  const [isExporting, setIsExporting] = useState(false);

  // Handle export click
  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export delay
    setTimeout(() => {
      toast({
        title: "Rapport exporté",
        description: "Le rapport a été exporté avec succès",
      });
      setIsExporting(false);
    }, 1500);
  };

  // Get period label based on filter
  const getPeriodLabel = () => {
    switch (periodFilter) {
      case "month":
        return format(new Date(), "MMMM yyyy", { locale: fr });
      case "quarter":
        const quarter = Math.floor(new Date().getMonth() / 3) + 1;
        return `${quarter}ème trimestre ${new Date().getFullYear()}`;
      case "year":
        return `Année ${new Date().getFullYear()}`;
      default:
        return format(new Date(), "yyyy", { locale: fr });
    }
  };

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
            <CardTitle>Rapports d'activité - {getPeriodLabel()}</CardTitle>
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

              {/* CA Tab Content */}
              <TabsContent value="ca" className="space-y-6">
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
                        <BarChart data={getCAMonthlyData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis 
                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                          />
                          <Tooltip 
                            formatter={(value) => [`${formatCurrency(value)}`, 'Chiffre d\'affaires']}
                          />
                          <Legend />
                          <Bar dataKey="ca" name="Chiffre d'affaires" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-slate-600">
                    <div>Source: Données de facturation</div>
                    <div>Dernière mise à jour: {format(new Date(), "dd/MM/yyyy")}</div>
                  </CardFooter>
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
                              data={getCAByClientData()}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {getCAByClientData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>TOP 5 clients</CardTitle>
                      <CardDescription>
                        Les clients qui génèrent le plus de chiffre d'affaires
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart 
                            layout="vertical" 
                            data={[
                              { name: "SAS TechPro", value: 15200 },
                              { name: "Cabinet Avocat", value: 12800 },
                              { name: "BTP Construct", value: 9500 },
                              { name: "Mairie Paris", value: 7600 },
                              { name: "Agence ComNet", value: 6300 },
                            ]} 
                            margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                            <YAxis type="category" dataKey="name" />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="value" name="CA" fill="#4f46e5" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Clients Tab Content */}
              <TabsContent value="clients" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">42</CardTitle>
                      <CardDescription>Clients actifs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+8% depuis le dernier trimestre</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">7</CardTitle>
                      <CardDescription>Nouveaux clients</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+2 vs mois précédent</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">92%</CardTitle>
                      <CardDescription>Taux de fidélisation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+5% sur 12 mois</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition géographique</CardTitle>
                    <CardDescription>
                      Distribution des clients par ville
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={[
                              { name: "Paris", value: 65 },
                              { name: "Lyon", value: 15 },
                              { name: "Marseille", value: 10 },
                              { name: "Bordeaux", value: 5 },
                              { name: "Autres", value: 5 },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: "Paris", value: 65 },
                              { name: "Lyon", value: 15 },
                              { name: "Marseille", value: 10 },
                              { name: "Bordeaux", value: 5 },
                              { name: "Autres", value: 5 },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Employees Tab Content */}
              <TabsContent value="employees" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">12</CardTitle>
                      <CardDescription>Employés actifs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-600">
                        8 manutentionnaires, 3 chauffeurs, 1 chef d'équipe
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">94%</CardTitle>
                      <CardDescription>Taux d'occupation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+6% vs trimestre précédent</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">{formatCurrency(2450)}</CardTitle>
                      <CardDescription>Coût salarial moyen</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-600">
                        Par employé et par mois
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance des employés</CardTitle>
                    <CardDescription>
                      Nombre de prestations réalisées par employé
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getEmployeePerformanceData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Prestations réalisées" stackId="a" fill="#22c55e" />
                          <Bar dataKey="canceled" name="Prestations annulées" stackId="a" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vehicles Tab Content */}
              <TabsContent value="vehicles" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">8</CardTitle>
                      <CardDescription>Véhicules actifs</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-600">
                        5 camions, 3 utilitaires
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">78%</CardTitle>
                      <CardDescription>Taux d'utilisation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-600">
                        En moyenne sur la période
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">2</CardTitle>
                      <CardDescription>Véhicules en maintenance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-orange-600 font-medium">
                        <span>Retour prévu: 18/10/2023</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Taux d'utilisation des véhicules</CardTitle>
                    <CardDescription>
                      Pourcentage d'utilisation par véhicule
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getVehicleUtilizationData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip formatter={(value) => [`${value}%`, 'Taux d\'utilisation']} />
                          <Bar dataKey="utilization" name="Taux d'utilisation" fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Finances Tab Content */}
              <TabsContent value="finances" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">{formatCurrency(168500)}</CardTitle>
                      <CardDescription>Chiffre d'affaires total</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+12.5% vs période précédente</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">{formatCurrency(84250)}</CardTitle>
                      <CardDescription>Charges totales</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-600">
                        50% du chiffre d'affaires
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-3xl font-bold">{formatCurrency(84250)}</CardTitle>
                      <CardDescription>Bénéfice net</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span>+15% vs période précédente</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Répartition CA / Coûts / Bénéfices</CardTitle>
                    <CardDescription>
                      Analyse mensuelle des revenus, coûts et bénéfices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getMonthlyCostsData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                          <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                          <Legend />
                          <Bar dataKey="ca" name="CA" stackId="a" fill="#2563eb" />
                          <Bar dataKey="costs" name="Coûts" stackId="b" fill="#ef4444" />
                          <Bar dataKey="profit" name="Bénéfice" stackId="c" fill="#22c55e" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

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
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {[
                              { name: "Salaires", value: 60 },
                              { name: "Carburant", value: 15 },
                              { name: "Matériel", value: 10 },
                              { name: "Maintenance", value: 8 },
                              { name: "Autres", value: 7 },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Pourcentage']} />
                          <Legend />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
