import { SEOHead } from "@/components/seo/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Calendar, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/lib/i18n/use-translation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function ContactPage() {
  const { t } = useTranslation();
  
  const contactFormSchema = z.object({
    firstName: z.string().min(1, t("contact.firstNameRequired")),
    lastName: z.string().min(1, t("contact.lastNameRequired")),
    email: z.string().email(t("contact.emailInvalid")),
    message: z.string().min(10, t("contact.messageMinLength")),
  });

  type ContactFormValues = z.infer<typeof contactFormSchema>;

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    toast({
      title: t("contact.messageSentTitle"),
      description: t("contact.messageSentDescription"),
    });
    console.log(data);
    form.reset();
  };

  const handleCalendlyClick = () => {
    window.open("https://www.calendly.com/dopaya/vc-30", "_blank");
  };

  return (
    <>
      <SEOHead
        title={t("contact.seoTitle")}
        description={t("contact.seoDescription")}
        keywords={t("contact.seoKeywords")}
        canonicalUrl="https://dopaya.com/contact"
        ogType="website"
        ogImage="https://dopaya.com/og-contact.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": t("contact.title"),
          "description": t("contact.subtitle"),
          "url": "https://dopaya.com/contact",
          "mainEntity": {
            "@type": "Organization",
            "name": "Dopaya",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "hello@dopaya.org",
              "availableLanguage": "English, German"
            }
          }
        }}
      />

      <div className={`container mx-auto py-24 px-4 md:px-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Left column */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("contact.title")}</h1>
            <p className="text-muted-foreground mb-8">
              {t("contact.subtitle")}
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">{t("contact.emailLabel")}</h3>
                  <a
                    href="mailto:hello@dopaya.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    hello@dopaya.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <MessageSquare className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">{t("contact.whatsappLabel")}</h3>
                  <a
                    href="https://wa.me/4917621140723"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +4917621140723
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <Calendar className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">{t("contact.calendlyLabel")}</h3>
                  <button
                    onClick={handleCalendlyClick}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    {t("contact.calendlyButton")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Contact form */}
          <div className="bg-card p-6 rounded-lg shadow-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.firstNameLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("contact.firstNamePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("contact.lastNameLabel")}</FormLabel>
                        <FormControl>
                          <Input placeholder={t("contact.lastNamePlaceholder")} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("contact.emailFieldLabel")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("contact.emailPlaceholder")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("contact.messageLabel")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("contact.messagePlaceholder")}
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto bg-primary">
                  {t("contact.submitButton")}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}