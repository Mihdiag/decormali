import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calculator, Send, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_TITLE, APP_LOGO } from "@/const";

// Barèmes (utilisés pour le calcul ET affichés dans le devis)
const PRICES = {
  salon: { mattress: 130000, corner: 130000, arms: 96000, smallTable: 50000, bigTable: 130000, delivery: 75000 },
  carpet: { pricePerSqm: 13000, delivery: 75000 },
  curtain: { dubai: 6000, quality2: 4500, quality3: 4000, delivery: 75000 },
};

function QuotePage() {
  const [activeTab, setActiveTab] = useState("salon");

  // ----- SALON (formes L/U + mètres par côté)
  const [salonData, setSalonData] = useState({
    shape: "L",          // "L" ou "U"
    sideA_m: 4,          // L : côté A / U : côté gauche
    sideB_m: 3,          // L : côté B / U : côté central
    sideC_m: 0,          // U : côté droit
    mattressLength_m: 1.9,
    hasSmallTable: false,
    hasBigTable: false,
    needsDelivery: false,
  });

  // ----- TAPIS
  const [carpetData, setCarpetData] = useState({ length: 3, width: 2, needsDelivery: false });

  // ----- RIDEAUX
  const [curtainData, setCurtainData] = useState({ length: 2.5, width: 3, quality: "dubai", needsDelivery: false });

  // ----- Client
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Calcul géométrique salon (L/U)
  const calcSalonGeometry = (data) => {
    const COIN_M = 1;
    const ml = Math.max(0.5, Number(data.mattressLength_m || 1.9));

    const isL = data.shape === "L";
    const sides = isL
      ? [
          { id: "A", len: Math.max(0, Number(data.sideA_m || 0)), coinsOnSide: 1 },
          { id: "B", len: Math.max(0, Number(data.sideB_m || 0)), coinsOnSide: 1 },
        ]
      : [
          { id: "Gauche", len: Math.max(0, Number(data.sideA_m || 0)), coinsOnSide: 1 },
          { id: "Central", len: Math.max(0, Number(data.sideB_m || 0)), coinsOnSide: 2 },
          { id: "Droit", len: Math.max(0, Number(data.sideC_m || 0)), coinsOnSide: 1 },
        ];

    const perSide = sides.map((s) => {
      const effective = Math.max(0, s.len - s.coinsOnSide * COIN_M);
      const mattresses = effective === 0 ? 0 : Math.ceil(effective / ml);
      return { ...s, effective, mattresses };
    });

    const corners = isL ? 1 : 2;
    const arms = 2;
    const mattressCount = perSide.reduce((acc, s) => acc + s.mattresses, 0);

    return { corners, arms, mattressCount, perSide, mattressLength_m: ml };
  };

  // ----- Calculs
  const calculateSalonPrice = () => {
    const geom = calcSalonGeometry(salonData);

    const mattressTotal = geom.mattressCount * PRICES.salon.mattress;
    const cornerTotal = geom.corners * PRICES.salon.corner;
    const armsTotal = geom.arms * PRICES.salon.arms;
    const smallTableTotal = salonData.hasSmallTable ? PRICES.salon.smallTable : 0;
    const bigTableTotal = salonData.hasBigTable ? PRICES.salon.bigTable : 0;
    const deliveryTotal = salonData.needsDelivery ? PRICES.salon.delivery : 0;

    const subtotal = mattressTotal + cornerTotal + armsTotal + smallTableTotal + bigTableTotal;
    const total = subtotal + deliveryTotal;

    return {
      type: "salon",
      breakdown: {
        forme: salonData.shape,
        cotes: geom.perSide,
        matelas: { count: geom.mattressCount, unitPrice: PRICES.salon.mattress, total: mattressTotal },
        coins: { count: geom.corners, unitPrice: PRICES.salon.corner, total: cornerTotal },
        bras: { count: geom.arms, unitPrice: PRICES.salon.arms, total: armsTotal },
        petiteTable: { included: salonData.hasSmallTable, total: smallTableTotal },
        grandeTable: { included: salonData.hasBigTable, total: bigTableTotal },
        livraison: { included: salonData.needsDelivery, total: deliveryTotal },
        params: { mattressLength_m: geom.mattressLength_m },
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
    if (activeTab === "salon") result = calculateSalonPrice();
    else if (activeTab === "carpet") result = calculateCarpetPrice();
    else result = calculateCurtainPrice();
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
    setTimeout(() => {
      toast.success("Demande de devis envoyée. Nous vous contacterons bientôt.");
      setCustomerInfo({ name: "", email: "", phone: "", address: "", notes: "" });
      setCalculatedPrice(null);
      setIsSubmitting(false);
    }, 1000);
  };

  const formatPrice = (price) => new Intl.NumberFormat("fr-FR").format(price) + " FCFA";

  // ----- UI
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              alt="Decor Mali"
              className="h-8 w-8 rounded-full ring-1 ring-muted object-contain"
            />
            <span className="font-semibold">{APP_TITLE}</span>
          </div>
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
            <p className="text-muted-foreground">Estimation détaillée avec prix.</p>
          </div>

          <Tabs defaultValue="salon" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="salon">Salon</TabsTrigger>
              <TabsTrigger value="carpet">Tapis</TabsTrigger>
              <TabsTrigger value="curtain">Rideaux</TabsTrigger>
            </TabsList>

            {/* SALON */}
            <TabsContent value="salon" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du Salon</CardTitle>
                  <CardDescription>Forme en L ou en U, longueurs en mètres</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Forme du salon</Label>
                      <Select value={salonData.shape} onValueChange={(v) => setSalonData({ ...salonData, shape: v })}>
                        <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="U">U</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Longueur d’un matelas (m)</Label>
                      <Input
                        type="number" step="0.1" min="0.5"
                        value={salonData.mattressLength_m}
                        onChange={(e) => setSalonData({ ...salonData, mattressLength_m: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {salonData.shape === "L" ? (
                    <div className="grid md:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label>Côté A (m)</Label>
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideA_m}
                          onChange={(e) => setSalonData({ ...salonData, sideA_m: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Côté B (m)</Label>
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideB_m}
                          onChange={(e) => setSalonData({ ...salonData, sideB_m: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Coins (auto)</Label>
                        <Input value="1" disabled />
                      </div>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-4 gap-6 pt-2">
                      <div className="space-y-2">
                        <Label>Gauche (m)</Label>
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideA_m}
                          onChange={(e) => setSalonData({ ...salonData, sideA_m: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Central (m)</Label>
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideB_m}
                          onChange={(e) => setSalonData({ ...salonData, sideB_m: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Droit (m)</Label>
                        <Input type="number" step="0.1" min="0"
                          value={salonData.sideC_m}
                          onChange={(e) => setSalonData({ ...salonData, sideC_m: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Coins (auto)</Label>
                        <Input value="2" disabled />
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smallTable"
                        checked={salonData.hasSmallTable}
                        onCheckedChange={(v) => setSalonData({ ...salonData, hasSmallTable: !!v })}
                      />
                      <Label htmlFor="smallTable">Petite table</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bigTable"
                        checked={salonData.hasBigTable}
                        onCheckedChange={(v) => setSalonData({ ...salonData, hasBigTable: !!v })}
                      />
                      <Label htmlFor="bigTable">Grande table</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delivery"
                        checked={salonData.needsDelivery}
                        onCheckedChange={(v) => setSalonData({ ...salonData, needsDelivery: !!v })}
                      />
                      <Label htmlFor="delivery">Livraison</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estimation du Prix</CardTitle>
                  <CardDescription>Calcul selon les dimensions et la forme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "salon" && (
                    <div className="space-y-3">
                      {calculatedPrice.breakdown.cotes?.length > 0 && (
                        <div className="rounded-md border p-3 text-sm">
                          <div className="font-medium mb-2">Détail par côté</div>
                          {calculatedPrice.breakdown.cotes.map((c) => (
                            <div key={c.id} className="flex justify-between">
                              <span>{c.id} : {c.len} m — utile {Number(c.effective).toFixed(2)} m</span>
                              <span className="font-medium">Matelas : {c.mattresses}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Matelas ({calculatedPrice.breakdown.matelas.count})</span>
                            <span className="font-medium">{formatPrice(calculatedPrice.breakdown.matelas.total)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Coins ({calculatedPrice.breakdown.coins.count})</span>
                            <span className="font-medium">{formatPrice(calculatedPrice.breakdown.coins.total)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Bras ({calculatedPrice.breakdown.bras.count})</span>
                            <span className="font-medium">{formatPrice(calculatedPrice.breakdown.bras.total)}</span>
                          </div>
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
                          {calculatedPrice.breakdown.livraison.included && (
                            <div className="flex justify-between text-sm">
                              <span>Livraison</span>
                              <span className="font-medium">{formatPrice(calculatedPrice.breakdown.livraison.total)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col justify-center items-end">
                          <div className="text-lg font-semibold">Sous-total : {formatPrice(calculatedPrice.subtotal)}</div>
                          <div className="text-xl font-bold">Total : {formatPrice(calculatedPrice.total)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAPIS */}
            <TabsContent value="carpet" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration du Tapis</CardTitle>
                  <CardDescription>Surface et options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label>Longueur (m)</Label>
                      <Input type="number" step="0.1" min="0"
                        value={carpetData.length}
                        onChange={(e) => setCarpetData({ ...carpetData, length: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Largeur (m)</Label>
                      <Input type="number" step="0.1" min="0"
                        value={carpetData.width}
                        onChange={(e) => setCarpetData({ ...carpetData, width: Number(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="carpetDelivery"
                        checked={carpetData.needsDelivery}
                        onCheckedChange={(v) => setCarpetData({ ...carpetData, needsDelivery: !!v })}
                      />
                      <Label htmlFor="carpetDelivery">Livraison</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "carpet" && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Surface (m²)</span>
                          <span className="font-medium">
                            {(carpetData.length * carpetData.width).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Prix / m²</span>
                          <span className="font-medium">{formatPrice(PRICES.carpet.pricePerSqm)}</span>
                        </div>
                        {calculatedPrice.breakdown.livraison.included && (
                          <div className="flex justify-between text-sm">
                            <span>Livraison</span>
                            <span className="font-medium">{formatPrice(calculatedPrice.breakdown.livraison.total)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-center items-end">
                        <div className="text-lg font-semibold">Sous-total : {formatPrice(calculatedPrice.subtotal)}</div>
                        <div className="text-xl font-bold">Total : {formatPrice(calculatedPrice.total)}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* RIDEAUX */}
            <TabsContent value="curtain" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration des Rideaux</CardTitle>
                  <CardDescription>Qualité, dimensions et options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label>Hauteur (m)</Label>
                      <Input type="number" step="0.1" min="0"
                        value={curtainData.length}
                        onChange={(e) => setCurtainData({ ...curtainData, length: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Largeur (m)</Label>
                      <Input type="number" step="0.1" min="0"
                        value={curtainData.width}
                        onChange={(e) => setCurtainData({ ...curtainData, width: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Qualité</Label>
                      <Select value={curtainData.quality} onValueChange={(v) => setCurtainData({ ...curtainData, quality: v })}>
                        <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dubai">Dubai</SelectItem>
                          <SelectItem value="quality2">Qualité 2</SelectItem>
                          <SelectItem value="quality3">Qualité 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="curtainDelivery"
                        checked={curtainData.needsDelivery}
                        onCheckedChange={(v) => setCurtainData({ ...curtainData, needsDelivery: !!v })}
                      />
                      <Label htmlFor="curtainDelivery">Livraison</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "curtain" && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Surface (m²)</span>
                          <span className="font-medium">
                            {(curtainData.length * curtainData.width).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Prix / m²</span>
                          <span className="font-medium">{formatPrice(PRICES.curtain[curtainData.quality])}</span>
                        </div>
                        {calculatedPrice.breakdown.livraison.included && (
                          <div className="flex justify-between text-sm">
                            <span>Livraison</span>
                            <span className="font-medium">{formatPrice(calculatedPrice.breakdown.livraison.total)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-center items-end">
                        <div className="text-lg font-semibold">Sous-total : {formatPrice(calculatedPrice.subtotal)}</div>
                        <div className="text-xl font-bold">Total : {formatPrice(calculatedPrice.total)}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Coordonnées */}
          <Card>
            <CardHeader>
              <CardTitle>Vos coordonnées</CardTitle>
              <CardDescription>Nous vous contacterons pour finaliser l’offre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input value={customerInfo.address} onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={customerInfo.notes} onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })} placeholder="Informations complémentaires…" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSubmitQuote} disabled={isSubmitting} className="gap-2">
                  <Send className="w-4 h-4" />
                  Envoyer la demande de devis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t">
        <div className="container py-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} {APP_TITLE}. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

export default QuotePage;
