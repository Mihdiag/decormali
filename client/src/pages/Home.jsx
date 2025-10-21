import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";
import { Sofa, Ruler, Package, Phone, MapPin, Facebook, Instagram, Mail, MessageCircle, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sofa className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/quote">
              <Button>Demander un devis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-50 via-background to-amber-50 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-64 h-64 border-4 border-orange-500 rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 border-4 border-amber-500 rounded-full" />
        </div>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Salons marocains, tapis & rideaux sur-mesure à Bamako
            </h1>
            <p className="text-lg text-muted-foreground">
              Conception, fabrication et installation soignées. Contactez-nous pour une estimation personnalisée.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/quote">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Calculer mon devis
                </Button>
              </Link>
              <a href="https://www.facebook.com/people/D%C3%A9cor-Mali/61579188246177/?locale=fr_FR" target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="border-orange-200 hover:bg-orange-50">
                  <Facebook className="mr-2 h-5 w-5" />
                  Facebook
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sofa className="h-5 w-5 text-orange-600" /> Salons marocains
                </CardTitle>
                <CardDescription>Confort, durabilité, finitions premium.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Fabrication sur mesure, modules L ou U, tissus au choix, livraison à domicile.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-orange-600" /> Tapis & rideaux
                </CardTitle>
                <CardDescription>Prise de mesures et pose.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Choix de textures et coloris. Nous vous aidons à harmoniser vos espaces.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" /> Livraison & installation
                </CardTitle>
                <CardDescription>Service clé en main.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Livraison à Bamako et montage par nos équipes spécialisées.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Appel à action */}
      <section className="py-10">
        <div className="container text-center">
          <div className="inline-flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-100">
            <span className="text-sm">Besoin d’un chiffrage rapide ?</span>
            <Link href="/quote">
              <Button className="bg-orange-600 hover:bg-orange-700">Calculer mon devis personnalisé</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Contactez-nous</h2>
            <p className="text-muted-foreground">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <a href="tel:+22370932462" className="flex items-center gap-2 hover:opacity-90">
                <Phone className="h-5 w-5 text-orange-600" />
                <span className="font-medium">+223 70 93 24 62</span>
              </a>

              <a href="https://wa.me/22370932462" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:opacity-90">
                <MessageCircle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">WhatsApp : +223 70 93 24 62</span>
              </a>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Toujours ouvert</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Bamako, Mali</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-orange-600" />
                <span className="font-medium">contact@decormali.com</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <a href="https://www.facebook.com/people/D%C3%A9cor-Mali/61579188246177/?locale=fr_FR" target="_blank" rel="noreferrer">
                <Button variant="outline" size="icon" className="border-orange-200 hover:bg-orange-50">
                  <Facebook className="h-5 w-5 text-orange-600" />
                </Button>
              </a>
              <Button variant="outline" size="icon" className="border-orange-200 hover:bg-orange-50">
                <Instagram className="h-5 w-5 text-orange-600" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_TITLE}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
