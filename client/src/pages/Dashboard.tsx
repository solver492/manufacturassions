import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar as CalendarIcon,
  BarChart4,
  Euro,
  Users,
  TrendingUp,
  ArrowUpRight,
  FilterX,
  Download,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";
import ChartContainer from "@/components/dashboard/ChartContainer";
import AlertItem from "@/components/dashboard/AlertItem";
import { formatCurrency } from "@/lib/utils/formatUtils";
import { DashboardKPI, ChartData, Alert, PlanningItem } from "@/lib/types";

const Dashboard = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await fetch('/api/dashboard/export', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Succès",
        description: "Le rapport a été exporté avec succès",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter le rapport",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch dashboard KPIs
  const { data: kpis, isLoading: isLoadingKpis } = useQuery<DashboardKPI>({
    queryKey: ["/api/dashboard/kpis"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les KPIs du tableau de bord",
        variant: "destructive",
      });
    },
  });

  // Fetch chart data
  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartData>({
    queryKey: ["/api/dashboard/charts"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des graphiques",
        variant: "destructive",
      });
    },
  });

  // Fetch alerts
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/dashboard/alerts"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger les alertes",
        variant: "destructive",
      });
    },
  });

  // Fetch planning du jour
  const { data: planningDuJour, isLoading: isLoadingPlanning } = useQuery<PlanningItem[]>({
    queryKey: ["/api/dashboard/planning-jour"],
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de charger le planning du jour",
        variant: "destructive",
      });
    },
  });

  // Transform chart data for recharts components
  const caEvolutionData = charts?.caEvolution.labels.map((label, index) => ({
    name: label,
    value: charts.caEvolution.data[index],
  })) || [];

  const repartitionData = charts?.repartitionSites.labels.map((label, index) => ({
    name: label,
    value: charts.repartitionSites.data[index],
  })) || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <Select defaultValue="mois">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="mois">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="default" className="flex items-center gap-2">
              <FilterX className="h-4 w-4" />
              Filtrer
            </Button>
            <Button 
              variant="secondary" 
              className="flex items-center gap-2" 
              onClick={handleExport}
              disabled={isLoadingKpis || isLoadingCharts}
            >
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoadingKpis ? (
            Array(4)
              .fill(0)
              .map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-5">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                </Card>
              ))
          ) : (
            <>
              <StatCard
                title="CA Mensuel"
                value={formatCurrency(kpis?.caMensuel || 0)}
                icon={<Euro />}
                change={12.5}
                iconBgColor="bg-primary"
              />
              <StatCard
                title="Prestations (Mois)"
                value={kpis?.prestationsMensuel?.toString() || "0"}
                icon={<CalendarIcon />}
                change={8.2}
                iconBgColor="bg-secondary"
              />
              <StatCard
                title="Taux de Paiement"
                value={`${kpis?.tauxPaiement || 0}%`}
                icon={<TrendingUp />}
                change={-2.1}
                iconBgColor="bg-green-500"
              />
              <StatCard
                title="Nouveaux Clients"
                value={kpis?.nouveauxClients?.toString() || "0"}
                icon={<Users />}
                change={25}
                iconBgColor="bg-accent"
              />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {isLoadingCharts ? (
            Array(2)
              .fill(0)
              .map((_, index) => (
                <Card key={index}>
                  <div className="p-5 border-b border-slate-200">
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <CardContent className="p-5">
                    <Skeleton className="h-80 w-full" />
                  </CardContent>
                </Card>
              ))
          ) : (
            <>
              <ChartContainer
                title="Évolution du Chiffre d'Affaires"
                type="bar"
                data={caEvolutionData}
                dataKey="value"
              />
              <ChartContainer
                title="Répartition par Sites Clients"
                type="pie"
                data={repartitionData}
                dataKey="value"
              >
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {repartitionData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <span
                        className="h-3 w-3 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            index === 0
                              ? "#2563eb"
                              : index === 1
                              ? "#4f46e5"
                              : index === 2
                              ? "#22c55e"
                              : "#ec4899",
                        }}
                      ></span>
                      <span className="text-sm text-slate-600">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </ChartContainer>
            </>
          )}
        </div>

        {/* Info Rows */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Planning du jour */}
          <div className="col-span-2 bg-white rounded-lg shadow">
            <div className="p-5 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-slate-900">Planning du jour</h3>
              <Link href="/calendar">
                <a className="text-sm text-primary hover:text-primary-dark">Voir calendrier complet</a>
              </Link>
            </div>
            <div className="p-5 overflow-hidden">
              {isLoadingPlanning ? (
                <div className="space-y-4">
                  {Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full" />
                    ))}
                </div>
              ) : planningDuJour && planningDuJour.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {planningDuJour.map((item) => (
                    <li key={item.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="bg-blue-100 text-blue-800 flex items-center justify-center rounded-md w-12 h-12 text-sm font-medium">
                            {item.heure}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{item.client}</p>
                          <p className="text-sm text-slate-500">{item.description}</p>
                        </div>
                        <div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.statut === "en_cours"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.statut === "en_cours" ? "En cours" : "Planifié"}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <CalendarIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900">Aucune prestation aujourd'hui</h3>
                  <p className="mt-1 text-sm text-slate-500">Planifiez une nouvelle prestation pour aujourd'hui.</p>
                  <div className="mt-6">
                    <Link href="/prestations">
                      <Button>
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Nouvelle prestation
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alertes */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-5 border-b border-slate-200">
              <h3 className="text-lg leading-6 font-medium text-slate-900">Alertes</h3>
            </div>
            <div className="p-5">
              {isLoadingAlerts ? (
                <div className="space-y-4">
                  {Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <Skeleton key={index} className="h-16 w-full" />
                    ))}
                </div>
              ) : alerts && alerts.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {alerts.map((alert, index) => (
                    <AlertItem key={index} alert={alert} />
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <BarChart4 className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900">Aucune alerte</h3>
                  <p className="mt-1 text-sm text-slate-500">Tout semble fonctionner correctement.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
