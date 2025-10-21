import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";
import { Sofa, Ruler, Package, Phone, MapPin, Facebook, Instagram, Mail } from "lucide-react";

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
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className="text-sm font-medium hover:text-primary transition-colors">Accueil</a>
            </Link>
            <Link href="/quote">
              <a className="text-sm font-medium hover:text-primary transition-colors">Devis</a>
            </Link>
          </nav>
          <Link href="/quote">
            <Button>Demander un devis</Button>
          </Link>
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
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 bg-clip-text text-transparent">
              Équipements de Maison de Qualité
            </h1>
            <p className="text-xl text-muted-foreground">
              Salons marocains, mauritaniens, tapis, rideaux et moquettes sur mesure à Bamako
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/quote">
                <Button size="lg" className="gap-2 bg-orange-600 hover:bg-orange-700">
                  <Ruler className="h-5 w-5" />
                  Calculer un devis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Nos Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-orange-200">
              <CardHeader>
                <Sofa className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Salons sur Mesure</CardTitle>
                <CardDescription>
                  Salons marocains et mauritaniens fabriqués selon vos dimensions et préférences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Choix de tissus variés</li>
                  <li>• Épaisseurs personnalisables</li>
                  <li>• Tables assorties disponibles</li>
                  <li>• Livraison et installation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <Ruler className="h-12 w-12 text-amber-600 mb-4" />
                <CardTitle>Tapis & Moquettes</CardTitle>
                <CardDescription>
                  Large sélection de tapis et moquettes pour tous les espaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Dimensions personnalisées</li>
                  <li>• Qualité premium</li>
                  <li>• Prix compétitifs</li>
                  <li>• Livraison rapide</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardHeader>
                <Package className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Devis Instantané</CardTitle>
                <CardDescription>
                  Calculez votre devis en ligne en quelques clics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Calcul automatique</li>
                  <li>• Prix transparents</li>
                  <li>• Réponse rapide</li>
                  <li>• Visite sur place possible</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Info Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Tarifs</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-700">Salons Marocains</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Matelas standard (1m90)</span>
                    <span className="font-semibold">130 000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coin (1m x 1m)</span>
                    <span className="font-semibold">130 000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bras (paire)</span>
                    <span className="font-semibold">96 000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Petite table</span>
                    <span className="font-semibold">50 000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grande table</span>
                    <span className="font-semibold">130 000 FCFA</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      * Tissu par défaut : Moutarras | Épaisseur : 30cm
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-700">Tapis & Rideaux</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tapis (par m²)</span>
                    <span className="font-semibold">13 000 FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rideaux 1ère qualité</span>
                    <span className="font-semibold">6 000 FCFA/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rideaux 2ème qualité</span>
                    <span className="font-semibold">4 500 FCFA/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rideaux 3ème qualité</span>
                    <span className="font-semibold">4 000 FCFA/m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Livraison Bamako</span>
                    <span className="font-semibold">75 000 FCFA</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Exemple : Tapis 5m x 4m = 260 000 FCFA
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="text-center mt-8">
              <Link href="/quote">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  Calculer mon devis personnalisé
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Contactez-nous</h2>
            <p className="text-muted-foreground">
              Notre équipe est à votre disposition pour répondre à toutes vos questions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-orange-600" />
                <span className="font-medium">+223 XX XX XX XX</span>
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
              <Button variant="outline" size="icon" className="border-orange-200 hover:bg-orange-50">
                <Facebook className="h-5 w-5 text-orange-600" />
              </Button>
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
          <p>&copy; 2025 {APP_TITLE}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

