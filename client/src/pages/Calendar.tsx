import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { CalendarEvent, Prestation, Site } from "@/lib/types";
import { getStatusColor } from "@/lib/utils/formatUtils";
import { PlusIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils/dateUtils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import PrestationForm from "@/components/prestations/PrestationForm";
import { cn } from "@/lib/utils";

const Calendar = () => {
  const { toast } = useToast();
  const [view, setView] = useState<"dayGridMonth" | "timeGridWeek" | "timeGridDay">("dayGridMonth");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Prestation | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState("Calendrier des Prestations");
  const [currentViewTitle, setCurrentViewTitle] = useState("");
  const [newPrestationOpen, setNewPrestationOpen] = useState(false);

  // Fetch prestations for calendar
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

  // Fetch sites for filtering
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

    const getStatusPaiement = (statutPrestation: string | undefined, statutPaiement: string | undefined, dateEcheance?: string): string => {
        if (statutPrestation === "termine" && statutPaiement === "paye") {
            return "paid";
        }
        if (statutPrestation === "termine" && statutPaiement === "en_attente") {
            return "unpaid";
        }
        if (statutPrestation === "termine" && statutPaiement === "retard" || (dateEcheance && new Date(dateEcheance) < new Date())) {
            return "late";
        }
        return "unpaid";
    };

  // Process calendar events
  const calendarEvents: CalendarEvent[] = prestations
    ? prestations
        .filter((prestation) => selectedSiteId === "all" || prestation.siteId.toString() === selectedSiteId)
        .map((prestation) => {
          const site = sites?.find((site) => site.id === prestation.siteId);
          const color = getStatusColor(prestation.statutPrestation);
          let backgroundColor;

          if (prestation.statutPrestation === "termine" && prestation.statutPaiement === "paye") {
            backgroundColor = "#22c55e"; // vert
          } else if (prestation.statutPrestation === "termine" && prestation.statutPaiement === "en_attente") {
            backgroundColor = "#f97316"; // orange
          } else if ((prestation.statutPrestation === "termine" && prestation.statutPaiement === "retard") || 
                     (prestation.dateEcheance && new Date(prestation.dateEcheance) < new Date())) {
            backgroundColor = "#ef4444"; // rouge
          } else {
            backgroundColor = "#3b82f6"; // bleu par défaut
          }

          if (prestation.statutPrestation === "planifie") {
              backgroundColor = "#3b82f6";
          }

          if (prestation.statutPrestation === "annule") {
              backgroundColor = "#9ca3af";
          }

          return {
            ...prestation,
            title: site?.nomSite || "Site inconnu",
            start: prestation.datePrestation + (prestation.heureDebut ? `T${prestation.heureDebut}` : ""),
            end: prestation.datePrestation + (prestation.heureFin ? `T${prestation.heureFin}` : ""),
            backgroundColor,
            borderColor: backgroundColor,
            siteName: site?.nomSite || "Site inconnu",
            color,
          };
        })
    : [];

  // Handle event click
  const handleEventClick = (info: any) => {
    const eventId = parseInt(info.event.id);
    const prestation = prestations?.find((p) => p.id === eventId);
    if (prestation) {
      setSelectedEvent(prestation);
    }
  };

  // Handle date click (for creating new prestations)
  const handleDateClick = (info: any) => {
    // Just set the date for now, the dialog will be opened separately
    setSelectedDate(info.date);
  };

  // Update title based on view change
  const handleViewChange = (viewInfo: any) => {
    setCurrentViewTitle(viewInfo.view.title);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
          <div className="flex space-x-2">
            <div className="relative">
              <Select
                value={selectedSiteId}
                onValueChange={(value) => setSelectedSiteId(value)}
                disabled={isLoadingSites}
              >
                <SelectTrigger className="w-[180px]">
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
            <Dialog open={newPrestationOpen} onOpenChange={setNewPrestationOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Nouvelle Prestation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <PrestationForm 
                  onSuccess={() => setNewPrestationOpen(false)} 
                  mode="create"
                  initialData={{ 
                    datePrestation: formatDate(selectedDate.toISOString(), 'yyyy-MM-dd')
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow">
          <div className="p-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const calendarApi = (document.getElementsByClassName('fc')[0] as any)?.calendar;
                    if (calendarApi) {
                      calendarApi.today();
                    }
                  }}
                >
                  Aujourd'hui
                </Button>
                <div className="flex">
                  <Button
                    variant="outline"
                    className="rounded-r-none"
                    onClick={() => {
                      const calendarApi = (document.getElementsByClassName('fc')[0] as any)?.calendar;
                      if (calendarApi) {
                        calendarApi.prev();
                      }
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-l-none"
                    onClick={() => {
                      const calendarApi = (document.getElementsByClassName('fc')[0] as any)?.calendar;
                      if (calendarApi) {
                        calendarApi.next();
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{currentViewTitle}</h3>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant={view === "dayGridMonth" ? "default" : "outline"}
                  onClick={() => setView("dayGridMonth")}
                >
                  Mois
                </Button>
                <Button
                  variant={view === "timeGridWeek" ? "default" : "outline"}
                  onClick={() => setView("timeGridWeek")}
                >
                  Semaine
                </Button>
                <Button
                  variant={view === "timeGridDay" ? "default" : "outline"}
                  onClick={() => setView("timeGridDay")}
                >
                  Jour
                </Button>
              </div>
            </div>
          </div>

          <div className="p-5">
            {isLoadingPrestations ? (
              <Skeleton className="h-[600px] w-full" />
            ) : (
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={view}
                headerToolbar={false}
                locales={[frLocale]}
                locale="fr"
                events={calendarEvents}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                editable={true}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                height="auto"
                aspectRatio={1.8}
                firstDay={1} // Monday as first day
                viewDidMount={handleViewChange}
              />
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card className="shadow">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Légende</h3>
              </div>
              <CardContent className="p-5">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <span className="h-4 w-4 rounded bg-green-500 mr-2"></span>
                    <span className="text-sm text-slate-600">Terminé et payé</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-4 w-4 rounded bg-orange-500 mr-2"></span>
                    <span className="text-sm text-slate-600">Terminé, paiement en attente</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-4 w-4 rounded bg-red-500 mr-2"></span>
                    <span className="text-sm text-slate-600">En retard de paiement</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-4 w-4 rounded bg-blue-500 mr-2"></span>
                    <span className="text-sm text-slate-600">Planifié</span>
                  </div>
                  <div className="flex items-center">
                    <span className="h-4 w-4 rounded bg-slate-400 mr-2"></span>
                    <span className="text-sm text-slate-600">Annulé</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow">
              <div className="p-5 border-b border-slate-200">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Événement Sélectionné</h3>
              </div>
              <CardContent className="p-5">
                {selectedEvent ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Prestation #{selectedEvent.id}</h4>
                      <p className="text-sm text-slate-500">
                        {sites?.find((s) => s.id === selectedEvent.siteId)?.nomSite || "Site inconnu"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium">Date:</p>
                        <p>{formatDate(selectedEvent.datePrestation)}</p>
                      </div>
                      <div>
                        <p className="font-medium">Horaires:</p>
                        <p>
                          {selectedEvent.heureDebut || "--:--"} - {selectedEvent.heureFin || "--:--"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Manutentionnaires:</p>
                        <p>{selectedEvent.nbManutentionnaires}</p>
                      </div>
                      <div>
                        <p className="font-medium">Camions:</p>
                        <p>{selectedEvent.nbCamions}</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.location.href = `/prestations#${selectedEvent.id}`}
                      >
                        Voir les détails
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500 italic">
                    Cliquez sur un événement du calendrier pour en voir les détails ici.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;