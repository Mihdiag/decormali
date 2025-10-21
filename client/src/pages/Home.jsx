import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";
import { Sofa, Ruler, Package, Phone, MapPin, Facebook, Instagram, Mail, MessageCircle, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-background to-amber-50 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-64 h-64 border-4 border-orange-500 rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 border-4 border-amber-500 rounded-full" />
        </div>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Salons marocains, Tapis & Rideaux
            </h1>
            <p className="text-lg text-muted-foreground">
              Confection sur-mesure, livraison et installation à Bamako et environs.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/quote">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Calculer mon devis personnalisé
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-orange-600" />
                  Sur-mesure
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Mesures adaptées à votre espace : salons en L ou en U, tapis & rideaux au centimètre près.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-orange-600" />
                  Livraison & Pose
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Service complet : fabrication, livraison à Bamako et installation par nos équipes.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sofa className="h-5 w-5 text-orange-600" />
                  Qualité pro
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Matériaux sélectionnés et finitions soignées, durables au quotidien.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Info Section */}
      {/* Contact Section */}
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
              <a
                href="https://www.facebook.com/people/D%C3%A9cor-Mali/61579188246177/?locale=fr_FR"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="icon" className="border-orange-200 hover:bg-orange-50">
                  <Facebook className="h-5 w-5 text-orange-600" />
                </Button>
