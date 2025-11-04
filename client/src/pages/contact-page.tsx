import { SEOHead } from "@/components/seo/seo-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Calendar, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
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
      title: "Message sent",
      description: "Thank you for your message. We'll get back to you soon.",
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
        title="Contact Us | Get in Touch with Dopaya | Social Impact Platform"
        description="Contact the Dopaya team with your questions about donations, partnerships, social enterprises, or platform support. We're here to help you make a real impact."
        keywords="contact Dopaya, customer support, partnerships, donations help, platform support, social enterprise support, impact platform contact, get in touch"
        canonicalUrl="https://dopaya.org/contact"
        ogType="website"
        ogImage="https://dopaya.org/og-contact.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Dopaya",
          "description": "Get in touch with the Dopaya team for support and partnerships",
          "url": "https://dopaya.org/contact",
          "mainEntity": {
            "@type": "Organization",
            "name": "Dopaya",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "hello@dopaya.org",
              "availableLanguage": "English"
            }
          }
        }}
      />

      <div className={`container mx-auto py-24 px-4 md:px-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          {/* Left column */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h1>
            <p className="text-muted-foreground mb-8">
              In case you have any feedback or concerns, please feel free to
              write or schedule a call with us
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">Email</h3>
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
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">Whatsapp</h3>
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
                  <h3 className="font-semibold uppercase text-sm tracking-wider mb-2">Calendly Meeting</h3>
                  <button
                    onClick={handleCalendlyClick}
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Schedule time with us &rarr;
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
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
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
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe@example.com" {...field} />
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
                      <FormLabel>Message *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="How can we help you?"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto bg-primary">
                  Submit Form
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}