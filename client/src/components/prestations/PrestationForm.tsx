import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils/formatUtils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const prestationSchema = z.object({
  siteId: z.coerce.number().min(1, "Le site client est requis"),
  datePrestation: z.string().min(1, "La date est requise"),
  heureDebut: z.string().optional(),
  heureFin: z.string().optional(),
  nbManutentionnaires: z.coerce.number().min(1, "Au moins un manutentionnaire est requis"),
  nbCamions: z.coerce.number().min(0, "Ne peut pas être négatif"),
  montantPrevu: z.string().optional(),
  notes: z.string().optional(),
});

type PrestationFormValues = z.infer<typeof prestationSchema>;

interface PrestationFormProps {
  onSuccess: () => void;
  initialData?: any;
  mode: "create" | "edit";
}

const PrestationForm = ({ onSuccess, initialData, mode }: PrestationFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimatedAmount, setEstimatedAmount] = useState<number | null>(null);

  // Fetch sites for dropdown
  const { data: sites = [] } = useQuery({
    queryKey: ["/api/sites"],
  });

  const form = useForm<PrestationFormValues>({
    resolver: zodResolver(prestationSchema),
    defaultValues: {
      siteId: initialData?.siteId || "",
      datePrestation: initialData?.datePrestation || new Date().toISOString().split("T")[0],
      heureDebut: initialData?.heureDebut || "",
      heureFin: initialData?.heureFin || "",
      nbManutentionnaires: initialData?.nbManutentionnaires || 1,
      nbCamions: initialData?.nbCamions || 0,
      montantPrevu: initialData?.montantPrevu || "",
      notes: initialData?.notes || "",
    },
  });

  // Calculate estimated amount when form values change
  useEffect(() => {
    const values = form.getValues();
    const site = sites.find((s: any) => s.id === Number(values.siteId));
    
    if (site && site.tarifHoraire && values.heureDebut && values.heureFin) {
      const start = new Date(`2000-01-01T${values.heureDebut}`);
      const end = new Date(`2000-01-01T${values.heureFin}`);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const amount = site.tarifHoraire * durationHours * values.nbManutentionnaires;
        setEstimatedAmount(amount);
        form.setValue("montantPrevu", amount.toString());
      }
    }
  }, [form.watch("siteId"), form.watch("heureDebut"), form.watch("heureFin"), form.watch("nbManutentionnaires"), sites]);

  const createPrestationMutation = useMutation({
    mutationFn: async (data: PrestationFormValues) => {
      const prestationData = {
        ...data,
        statutPrestation: "planifie",
        statutPaiement: "en_attente"
      };
      try {
        const res = await apiRequest("POST", "/api/prestations", prestationData);
        if (!res.ok) {
          throw new Error("Erreur lors de la création de la prestation");
        }
        return res.json();
      } catch (error) {
        throw new Error("Erreur lors de la création de la prestation");
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Prestation créée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prestations"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création de la prestation",
        variant: "destructive",
      });
    },
  });

  const updatePrestationMutation = useMutation({
    mutationFn: async (data: PrestationFormValues) => {
      const res = await apiRequest("PUT", `/api/prestations/${initialData?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Prestation mise à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/prestations"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour de la prestation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: PrestationFormValues) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createPrestationMutation.mutateAsync(data);
      } else {
        await updatePrestationMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Nouvelle Prestation" : "Modifier la Prestation"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site client *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un site client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sites.map((site: any) => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.nomSite} - {site.ville}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="datePrestation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heureDebut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de début</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="heureFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nbManutentionnaires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de manutentionnaires *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nbCamions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de camions</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="montantPrevu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant estimé (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {estimatedAmount !== null && (
                <div className="flex items-end pb-2">
                  <span className="text-sm text-slate-500">
                    Calculé automatiquement: {formatCurrency(estimatedAmount)}
                  </span>
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes spéciales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations complémentaires..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PrestationForm;
