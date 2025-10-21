import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calculator, Send, ArrowLeft, Sofa } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_TITLE } from "@/const";

// Pricing constants
const PRICES = {
  salon: {
    mattress: 130000,
    corner: 130000,
    arms: 96000,
    smallTable: 50000,
    bigTable: 130000,
    delivery: 75000,
  },
  carpet: {
    pricePerSqm: 13000,
    delivery: 75000,
  },
  curtain: {
    dubai: 6000,
    quality2: 4500,
    quality3: 4000,
    delivery: 75000,
  },
};

export default function QuotePage() {
  const [activeTab, setActiveTab] = useState("salon");
  
  // Salon state
  const [salonData, setSalonData] = useState({
    mattressLength: 190,
    mattressCount: 3,
    cornerCount: 2,
    armCount: 2,
    hasSmallTable: false,
    hasBigTable: false,
    needsDelivery: false,
  });

  // Carpet state
  const [carpetData, setCarpetData] = useState({
    length: 5,
    width: 4,
    needsDelivery: false,
  });

  // Curtain state
  const [curtainData, setCurtainData] = useState({
    length: 2.5,
    width: 3,
    quality: "dubai",
    needsDelivery: false,
  });

  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateSalonPrice = () => {
    const mattressTotal = salonData.mattressCount * PRICES.salon.mattress;
    const cornerTotal = salonData.cornerCount * PRICES.salon.corner;
    const armsTotal = salonData.armCount * PRICES.salon.arms;
    const smallTableTotal = salonData.hasSmallTable ? PRICES.salon.smallTable : 0;
    const bigTableTotal = salonData.hasBigTable ? PRICES.salon.bigTable : 0;
    const deliveryTotal = salonData.needsDelivery ? PRICES.salon.delivery : 0;

    const subtotal = mattressTotal + cornerTotal + armsTotal + smallTableTotal + bigTableTotal;
    const total = subtotal + deliveryTotal;

    return {
      type: "salon",
      breakdown: {
        matelas: { count: salonData.mattressCount, unitPrice: PRICES.salon.mattress, total: mattressTotal },
        coins: { count: salonData.cornerCount, unitPrice: PRICES.salon.corner, total: cornerTotal },
        bras: { count: salonData.armCount, unitPrice: PRICES.salon.arms, total: armsTotal },
        petiteTable: { included: salonData.hasSmallTable, total: smallTableTotal },
        grandeTable: { included: salonData.hasBigTable, total: bigTableTotal },
        livraison: { included: salonData.needsDelivery, total: deliveryTotal },
      },
      subtotal,
      total,
    };
  };

  const calculateCarpetPrice = () => {
    const area = carpetData.length * carpetData.width;
    const subtotal = area * PRICES.carpet.pricePerSqm;
    const deliveryTotal = carpetData.needsDelivery ? PRICES.carpet.delivery : 0;
    const total = subtotal + deliveryTotal;

    return {
      type: "carpet",
      breakdown: {
        dimensions: { length: carpetData.length, width: carpetData.width, area },
        pricePerSqm: PRICES.carpet.pricePerSqm,
        livraison: { included: carpetData.needsDelivery, total: deliveryTotal },
      },
      subtotal,
      total,
    };
  };

  const calculateCurtainPrice = () => {
    const area = curtainData.length * curtainData.width;
    const pricePerSqm = PRICES.curtain[curtainData.quality];
    const subtotal = area * pricePerSqm;
    const deliveryTotal = curtainData.needsDelivery ? PRICES.curtain.delivery : 0;
    const total = subtotal + deliveryTotal;

    return {
      type: "curtain",
      breakdown: {
        dimensions: { length: curtainData.length, width: curtainData.width, area },
        quality: curtainData.quality,
        pricePerSqm,
        livraison: { included: curtainData.needsDelivery, total: deliveryTotal },
      },
      subtotal,
      total,
    };
  };

  const handleCalculate = () => {
    let result;
    if (activeTab === "salon") {
      result = calculateSalonPrice();
    } else if (activeTab === "carpet") {
      result = calculateCarpetPrice();
    } else {
      result = calculateCurtainPrice();
    }
    setCalculatedPrice(result);
    toast.success("Prix calculé avec succès !");
  };

  const handleSubmitQuote = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Veuillez renseigner votre nom et téléphone");
      return;
    }

    if (!calculatedPrice) {
      toast.error("Veuillez d'abord calculer le prix");
      return;
    }

    setIsSubmitting(true);

    // Simulate sending email (in production, you'd use a service like EmailJS or Netlify Forms)
    setTimeout(() => {
      toast.success("Demande de devis envoyée avec succès ! Nous vous contacterons bientôt.");
      setIsSubmitting(false);
      
      // Reset form
      setCustomerInfo({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
      setCalculatedPrice(null);
    }, 1500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + " FCFA";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2">
              <Sofa className="h-6 w-6 text-orange-600" />
              <span className="font-bold text-xl">{APP_TITLE}</span>
            </a>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-12 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Calculateur de Devis</h1>
            <p className="text-muted-foreground">
              Obtenez une estimation instantanée pour vos projets de décoration
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="salon">Salon</TabsTrigger>
              <TabsTrigger value="carpet">Tapis</TabsTrigger>
              <TabsTrigger value="curtain">Rideaux</TabsTrigger>
            </TabsList>

            {/* Salon Tab */}
            <TabsContent value="salon" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du Salon</CardTitle>
                  <CardDescription>
                    Personnalisez votre salon marocain selon vos besoins
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="mattressLength">Longueur des matelas (cm)</Label>
                      <Input
                        id="mattressLength"
                        type="number"
                        value={salonData.mattressLength}
                        onChange={(e) => setSalonData({ ...salonData, mattressLength: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mattressCount">Nombre de matelas</Label>
                      <Input
                        id="mattressCount"
                        type="number"
                        min="0"
                        value={salonData.mattressCount}
                        onChange={(e) => setSalonData({ ...salonData, mattressCount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cornerCount">Nombre de coins</Label>
                      <Input
                        id="cornerCount"
                        type="number"
                        min="0"
                        value={salonData.cornerCount}
                        onChange={(e) => setSalonData({ ...salonData, cornerCount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="armCount">Nombre de bras</Label>
                      <Input
                        id="armCount"
                        type="number"
                        min="0"
                        value={salonData.armCount}
                        onChange={(e) => setSalonData({ ...salonData, armCount: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smallTable"
                        checked={salonData.hasSmallTable}
                        onCheckedChange={(checked) => setSalonData({ ...salonData, hasSmallTable: checked })}
                      />
                      <Label htmlFor="smallTable" className="cursor-pointer">
                        Ajouter une petite table (50 000 FCFA)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bigTable"
                        checked={salonData.hasBigTable}
                        onCheckedChange={(checked) => setSalonData({ ...salonData, hasBigTable: checked })}
                      />
                      <Label htmlFor="bigTable" className="cursor-pointer">
                        Ajouter une grande table (130 000 FCFA)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="salonDelivery"
                        checked={salonData.needsDelivery}
                        onCheckedChange={(checked) => setSalonData({ ...salonData, needsDelivery: checked })}
                      />
                      <Label htmlFor="salonDelivery" className="cursor-pointer">
                        Livraison à Bamako (75 000 FCFA)
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Carpet Tab */}
            <TabsContent value="carpet" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du Tapis</CardTitle>
                  <CardDescription>
                    Indiquez les dimensions de votre tapis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="carpetLength">Longueur (mètres)</Label>
                      <Input
                        id="carpetLength"
                        type="number"
                        step="0.1"
                        value={carpetData.length}
                        onChange={(e) => setCarpetData({ ...carpetData, length: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carpetWidth">Largeur (mètres)</Label>
                      <Input
                        id="carpetWidth"
                        type="number"
                        step="0.1"
                        value={carpetData.width}
                        onChange={(e) => setCarpetData({ ...carpetData, width: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Surface totale: <span className="font-semibold text-foreground">
                        {(carpetData.length * carpetData.width).toFixed(2)} m²
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Prix au m²: <span className="font-semibold text-foreground">13 000 FCFA</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="carpetDelivery"
                      checked={carpetData.needsDelivery}
                      onCheckedChange={(checked) => setCarpetData({ ...carpetData, needsDelivery: checked })}
                    />
                    <Label htmlFor="carpetDelivery" className="cursor-pointer">
                      Livraison à Bamako (75 000 FCFA)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Curtain Tab */}
            <TabsContent value="curtain" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration des Rideaux</CardTitle>
                  <CardDescription>
                    Choisissez les dimensions et la qualité de vos rideaux
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="curtainLength">Longueur (mètres)</Label>
                      <Input
                        id="curtainLength"
                        type="number"
                        step="0.1"
                        value={curtainData.length}
                        onChange={(e) => setCurtainData({ ...curtainData, length: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="curtainWidth">Largeur (mètres)</Label>
                      <Input
                        id="curtainWidth"
                        type="number"
                        step="0.1"
                        value={curtainData.width}
                        onChange={(e) => setCurtainData({ ...curtainData, width: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality">Qualité</Label>
                    <Select value={curtainData.quality} onValueChange={(value) => setCurtainData({ ...curtainData, quality: value })}>
                      <SelectTrigger id="quality">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dubai">1ère qualité (Dubai) - 6 000 FCFA/m²</SelectItem>
                        <SelectItem value="quality2">2ème qualité - 4 500 FCFA/m²</SelectItem>
                        <SelectItem value="quality3">3ème qualité - 4 000 FCFA/m²</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Surface totale: <span className="font-semibold text-foreground">
                        {(curtainData.length * curtainData.width).toFixed(2)} m²
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="curtainDelivery"
                      checked={curtainData.needsDelivery}
                      onCheckedChange={(checked) => setCurtainData({ ...curtainData, needsDelivery: checked })}
                    />
                    <Label htmlFor="curtainDelivery" className="cursor-pointer">
                      Livraison à Bamako (75 000 FCFA)
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleCalculate}
              className="gap-2 bg-orange-600 hover:bg-orange-700"
            >
              <Calculator className="h-5 w-5" />
              Calculer le prix
            </Button>
          </div>

          {/* Price Display */}
          {calculatedPrice && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-900">Estimation du Prix</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {calculatedPrice.type === "salon" && (
                    <>
                      {calculatedPrice.breakdown.matelas.count > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Matelas ({calculatedPrice.breakdown.matelas.count})</span>
                          <span className="font-medium">{formatPrice(calculatedPrice.breakdown.matelas.total)}</span>
                        </div>
                      )}
                      {calculatedPrice.breakdown.coins.count > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Coins ({calculatedPrice.breakdown.coins.count})</span>
                          <span className="font-medium">{formatPrice(calculatedPrice.breakdown.coins.total)}</span>
                        </div>
                      )}
                      {calculatedPrice.breakdown.bras.count > 0 && (
                        <div className="flex justify-between text-sm">
                          <span>Bras ({calculatedPrice.breakdown.bras.count})</span>
                          <span className="font-medium">{formatPrice(calculatedPrice.breakdown.bras.total)}</span>
                        </div>
                      )}
                      {calculatedPrice.breakdown.petiteTable.included && (
                        <div className="flex justify-between text-sm">
                          <span>Petite table</span>
                          <span className="font-medium">{formatPrice(calculatedPrice.breakdown.petiteTable.total)}</span>
                        </div>
                      )}
                      {calculatedPrice.breakdown.grandeTable.included && (
                        <div className="flex justify-between text-sm">
                          <span>Grande table</span>
                          <span className="font-medium">{formatPrice(calculatedPrice.breakdown.grandeTable.total)}</span>
                        </div>
                      )}
                    </>
                  )}

                  {calculatedPrice.type === "carpet" && (
                    <div className="flex justify-between text-sm">
                      <span>
                        Tapis ({calculatedPrice.breakdown.dimensions.length}m × {calculatedPrice.breakdown.dimensions.width}m = {calculatedPrice.breakdown.dimensions.area.toFixed(2)}m²)
                      </span>
                      <span className="font-medium">{formatPrice(calculatedPrice.subtotal)}</span>
                    </div>
                  )}

                  {calculatedPrice.type === "curtain" && (
                    <div className="flex justify-between text-sm">
                      <span>
                        Rideaux ({calculatedPrice.breakdown.dimensions.length}m × {calculatedPrice.breakdown.dimensions.width}m = {calculatedPrice.breakdown.dimensions.area.toFixed(2)}m²)
                      </span>
                      <span className="font-medium">{formatPrice(calculatedPrice.subtotal)}</span>
                    </div>
                  )}

                  {calculatedPrice.breakdown.livraison.included && (
                    <div className="flex justify-between text-sm">
                      <span>Livraison</span>
                      <span className="font-medium">{formatPrice(calculatedPrice.breakdown.livraison.total)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-orange-900">Total</span>
                    <span className="text-2xl font-bold text-orange-900">{formatPrice(calculatedPrice.total)}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  * Prix indicatif. Un devis final sera établi après visite sur place.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Customer Info Form */}
          {calculatedPrice && (
            <Card>
              <CardHeader>
                <CardTitle>Vos Coordonnées</CardTitle>
                <CardDescription>
                  Laissez-nous vos informations pour recevoir votre devis détaillé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="+223 XX XX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="votre@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="Votre adresse"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes supplémentaires</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Informations complémentaires..."
                    rows={4}
                  />
                </div>

                <Button
                  size="lg"
                  onClick={handleSubmitQuote}
                  disabled={isSubmitting}
                  className="w-full gap-2 bg-orange-600 hover:bg-orange-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Envoyer la demande de devis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2025 {APP_TITLE}. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

