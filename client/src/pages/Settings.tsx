import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const companySettingsSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  website: z.string().optional(),
  siret: z.string().min(14, "Le SIRET doit comporter 14 chiffres").max(14),
  tvaNumber: z.string().optional(),
});

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  remindersBefore24h: z.boolean(),
  remindersBeforeWeek: z.boolean(),
  paymentReminders: z.boolean(),
  marketingEmails: z.boolean(),
});

type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

const invoiceSettingsSchema = z.object({
  defaultPaymentTerms: z.string(),
  defaultTvaRate: z.string(),
  invoicePrefix: z.string(),
  invoiceNotes: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIban: z.string().optional(),
});

type InvoiceSettingsFormValues = z.infer<typeof invoiceSettingsSchema>;

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");

  // Company Settings Form
  const companyForm = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: "Mon Auxiliaire Déménagement",
      address: "123 Rue de la République, 75001 Paris",
      phone: "01 23 45 67 89",
      email: "contact@monauxiliaire.fr",
      website: "www.monauxiliaire.fr",
      siret: "12345678901234",
      tvaNumber: "FR12345678901",
    },
  });

  // Notification Settings Form
  const notificationForm = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      remindersBefore24h: true,
      remindersBeforeWeek: true,
      paymentReminders: true,
      marketingEmails: false,
    },
  });

  // Invoice Settings Form
  const invoiceForm = useForm<InvoiceSettingsFormValues>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      defaultPaymentTerms: "30",
      defaultTvaRate: "20",
      invoicePrefix: "F-",
      invoiceNotes: "Merci pour votre confiance.",
      bankName: "Crédit Mutuel",
      bankAccountNumber: "12345678901",
      bankIban: "FR76 1234 5678 9012 3456 7890 123",
    },
  });

  // Company Settings Mutation
  const updateCompanySettingsMutation = useMutation({
    mutationFn: async (data: CompanySettingsFormValues) => {
      // Dans un vrai système, nous enverrions ces données au serveur
      // const res = await apiRequest("PATCH", "/api/settings/company", data);
      // return res.json();
      
      // Pour l'instant, on retourne simplement les données
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Les paramètres de l'entreprise ont été mis à jour",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    },
  });

  // Notification Settings Mutation
  const updateNotificationSettingsMutation = useMutation({
    mutationFn: async (data: NotificationSettingsFormValues) => {
      // Dans un vrai système, nous enverrions ces données au serveur
      // const res = await apiRequest("PATCH", "/api/settings/notifications", data);
      // return res.json();
      
      // Pour l'instant, on retourne simplement les données
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Les paramètres de notification ont été mis à jour",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    },
  });

  // Invoice Settings Mutation
  const updateInvoiceSettingsMutation = useMutation({
    mutationFn: async (data: InvoiceSettingsFormValues) => {
      // Dans un vrai système, nous enverrions ces données au serveur
      // const res = await apiRequest("PATCH", "/api/settings/invoice", data);
      // return res.json();
      
      // Pour l'instant, on retourne simplement les données
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Les paramètres de facturation ont été mis à jour",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour les paramètres",
        variant: "destructive",
      });
    },
  });

  // Submit handlers
  const onSubmitCompanySettings = (data: CompanySettingsFormValues) => {
    updateCompanySettingsMutation.mutate(data);
  };

  const onSubmitNotificationSettings = (data: NotificationSettingsFormValues) => {
    updateNotificationSettingsMutation.mutate(data);
  };

  const onSubmitInvoiceSettings = (data: InvoiceSettingsFormValues) => {
    updateInvoiceSettingsMutation.mutate(data);
  };

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-gray-500 mt-2">Gérez les paramètres de votre entreprise et de l'application</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company">Entreprise</TabsTrigger>
          <TabsTrigger value="invoices">Facturation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Ces informations seront affichées sur vos factures et documents officiels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onSubmitCompanySettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={companyForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l'entreprise</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="siret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SIRET</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="tvaNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de TVA</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site web</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateCompanySettingsMutation.isPending}
                  >
                    {updateCompanySettingsMutation.isPending ? "Mise à jour..." : "Sauvegarder"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de facturation</CardTitle>
              <CardDescription>
                Personnalisez vos factures et définissez les paramètres par défaut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...invoiceForm}>
                <form onSubmit={invoiceForm.handleSubmit(onSubmitInvoiceSettings)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={invoiceForm.control}
                      name="invoicePrefix"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Préfixe des factures</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Sera ajouté avant le numéro de facture (ex: F-2023-001)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={invoiceForm.control}
                      name="defaultPaymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conditions de paiement par défaut (jours)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une durée" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">Paiement immédiat</SelectItem>
                              <SelectItem value="15">15 jours</SelectItem>
                              <SelectItem value="30">30 jours</SelectItem>
                              <SelectItem value="45">45 jours</SelectItem>
                              <SelectItem value="60">60 jours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={invoiceForm.control}
                      name="defaultTvaRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taux de TVA par défaut (%)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un taux" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="5.5">5.5%</SelectItem>
                              <SelectItem value="10">10%</SelectItem>
                              <SelectItem value="20">20%</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={invoiceForm.control}
                    name="invoiceNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes par défaut sur les factures</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Conditions de paiement, informations légales, etc."
                            className="h-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-4">Informations bancaires</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={invoiceForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de la banque</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={invoiceForm.control}
                      name="bankAccountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Numéro de compte</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={invoiceForm.control}
                      name="bankIban"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IBAN</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateInvoiceSettingsMutation.isPending}
                  >
                    {updateInvoiceSettingsMutation.isPending ? "Mise à jour..." : "Sauvegarder"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres des notifications</CardTitle>
              <CardDescription>
                Gérez quand et comment vous recevez des notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onSubmitNotificationSettings)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Notifications par email</FormLabel>
                            <FormDescription>
                              Recevoir des notifications par email
                            </FormDescription>
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

                    <FormField
                      control={notificationForm.control}
                      name="remindersBefore24h"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Rappels 24h avant</FormLabel>
                            <FormDescription>
                              Recevoir un rappel 24h avant chaque prestation
                            </FormDescription>
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

                    <FormField
                      control={notificationForm.control}
                      name="remindersBeforeWeek"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Rappels une semaine avant</FormLabel>
                            <FormDescription>
                              Recevoir un rappel une semaine avant chaque prestation
                            </FormDescription>
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

                    <FormField
                      control={notificationForm.control}
                      name="paymentReminders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Rappels de paiement</FormLabel>
                            <FormDescription>
                              Recevoir des notifications pour les factures non payées
                            </FormDescription>
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

                    <FormField
                      control={notificationForm.control}
                      name="marketingEmails"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Emails marketing</FormLabel>
                            <FormDescription>
                              Recevoir des informations sur les nouveautés et mises à jour du service
                            </FormDescription>
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
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateNotificationSettingsMutation.isPending}
                  >
                    {updateNotificationSettingsMutation.isPending ? "Mise à jour..." : "Sauvegarder"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;