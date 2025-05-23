import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Site } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const siteSchema = z.object({
  nomSite: z.string().min(1, "Le nom du site est requis"),
  ville: z.string().min(1, "La ville est requise"),
  adresse: z.string().min(1, "L'adresse est requise"),
  contactNom: z.string().optional(),
  contactTelephone: z.string().optional(),
  contactEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  tarifHoraire: z.string().optional(),
  notes: z.string().optional(),
  actif: z.boolean().default(true),
});

type SiteFormValues = z.infer<typeof siteSchema>;

interface SiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  site?: Site;
  mode: "create" | "edit";
}

const SiteModal = ({ isOpen, onClose, site, mode }: SiteModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      nomSite: site?.nomSite || "",
      ville: site?.ville || "",
      adresse: site?.adresse || "",
      contactNom: site?.contactNom || "",
      contactTelephone: site?.contactTelephone || "",
      contactEmail: site?.contactEmail || "",
      tarifHoraire: site?.tarifHoraire ? site.tarifHoraire.toString() : "",
      notes: site?.notes || "",
      actif: site?.actif !== undefined ? site.actif : true,
    },
  });

  const createSiteMutation = useMutation({
    mutationFn: async (data: SiteFormValues) => {
      const res = await apiRequest("POST", "/api/sites", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Site créé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la création du site",
        variant: "destructive",
      });
    },
  });

  const updateSiteMutation = useMutation({
    mutationFn: async (data: SiteFormValues) => {
      const res = await apiRequest("PUT", `/api/sites/${site?.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Site mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sites"] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Erreur lors de la mise à jour du site",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SiteFormValues) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createSiteMutation.mutateAsync(data);
      } else {
        await updateSiteMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nouveau Site" : "Modifier le Site"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nomSite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du site *</FormLabel>
                  <FormControl>
                    <Input placeholder="Entreprise ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ville"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville *</FormLabel>
                    <FormControl>
                      <Input placeholder="Paris" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tarifHoraire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarif horaire (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="90.00"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse complète *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="12 rue des Exemples, 75000 Paris"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="contactNom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactTelephone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input placeholder="0123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contact@exemple.fr"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes / Spécificités</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations supplémentaires..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="actif"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Site actif</FormLabel>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SiteModal;
