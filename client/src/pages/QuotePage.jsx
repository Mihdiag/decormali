import { useMemo, useState } from "react";
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

/** ------------------ Prix internes (non affichés en détail) ------------------ */
const PRICES = {
  salon: { mattress: 130000, corner: 130000, arms: 96000, smallTable: 50000, bigTable: 130000, delivery: 75000 },
  carpet: { pricePerSqm: 13000, delivery: 75000 },
  curtain: { dubai: 6000, quality2: 4500, quality3: 4000, delivery: 75000 },
};

/** ------------------ Schéma SVG des matelas ------------------ */
function SalonDiagram({ geom, depth = 0.7 }) {
  // Conversion m -> px auto pour rentrer dans 680x420
  const { widthPx, heightPx, scale, rects, coins } = useMemo(() => {
    const seatDepth = depth; // m
    // Définir les bras selon forme
    const sides = geom.perSide;
    // Taille max en mètres (pour vue basique)
    const maxX = Math.max(...sides.map(s => s.id === "A" || s.id === "Gauche" ? s.len : (s.id === "Central" ? s.len : seatDepth))) + seatDepth + 0.5;
    const maxY = Math.max(...sides.map(s => s.id === "B" || s.id === "Droit" ? s.len : (s.id === "Central" ? seatDepth : seatDepth))) + seatDepth + 0.5;

    const maxW = 680, maxH = 420;
    const scale = Math.min(maxW / maxX, maxH / maxY);

    const sd = seatDepth * scale;
    const gap = 0.06 * scale;

    const rects = [];
    const coins = [];

    const addHorizontal = (x0, y0, effectiveLen, ml) => {
      let used = 0;
      let i = 0;
      while (used + 1e-6 < effectiveLen) {
        const seg = Math.min(ml, effectiveLen - used);
        rects.push({
          x: (x0 + used) * scale, y: y0 * scale, w: seg * scale, h: sd,
          label: ++i,
        });
        used += seg;
      }
    };
    const addVertical = (x0, y0, effectiveLen, ml) => {
      let used = 0;
      let i = 0;
      while (used + 1e-6 < effectiveLen) {
        const seg = Math.min(ml, effectiveLen - used);
        rects.push({
          x: x0 * scale, y: (y0 + used) * scale, w: sd, h: seg * scale,
          label: ++i,
        });
        used += seg;
      }
    };

    const ml = geom.mattressLength_m;
    if (geom.forme === "L") {
      // Coin (1x1)
      coins.push({ x: 0, y: 0, s: scale * 1 });

      // Côté A : horizontal à droite depuis le coin
      const effA = Math.max(0, geom.perSide.find(s=>s.id==="A").effective);
      addHorizontal(1, 0, effA, ml);

      // Côté B : vertical vers le bas depuis le coin
      const effB = Math.max(0, geom.perSide.find(s=>s.id==="B").effective);
      addVertical(0, 1, effB, ml);

    } else {
      // Forme U : deux coins et un central
      // Coins 1x1 à gauche et à droite
      const central = geom.perSide.find(s=>s.id==="Central");
      const gauche = geom.perSide.find(s=>s.id==="Gauche");
      const droit = geom.perSide.find(s=>s.id==="Droit");

      coins.push({ x: 0, y: 0, s: scale * 1 });
      coins.push({ x: (1 + central.len), y: 0, s: scale * 1 });

      // Central : horizontal entre les deux coins
      addHorizontal(1, 0, Math.max(0, central.effective), ml);

      // Gauche : vertical vers le bas depuis coin gauche
      addVertical(0, 1, Math.max(0, gauche.effective), ml);

      // Droit : vertical vers le bas depuis coin droit (x=1+central.len)
      addVertical(1 + central.len, 1, Math.max(0, droit.effective), ml);
    }

    const widthPx = Math.min(680, (maxX) * scale + 8);
    const heightPx = Math.min(420, (maxY) * scale + 8);
    return { widthPx, heightPx, scale, rects, coins };
  }, [geom, depth]);

  return (
    <svg width={widthPx} height={heightPx} viewBox={`0 0 ${widthPx} ${heightPx}`} className="rounded-md bg-orange-50/40 border border-orange-100 mx-auto">
      {/* Coins */}
      {coins.map((c, i) => (
        <rect key={`c-${i}`} x={c.x} y={c.y} width={c.s} height={c.s} fill="#fed7aa" stroke="#fb923c" strokeWidth="2" opacity="0.9" />
      ))}
      {/* Matelas */}
      {rects.map((r, i) => (
        <g key={`m-${i}`}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6" ry="6" fill="#ffedd5" stroke="#fb923c" strokeWidth="2" />
          <text x={r.x + r.w/2} y={r.y + r.h/2} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9a3412">
            {r.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** ------------------ Page Devis ------------------ */
export default function QuotePage() {
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

    return { forme: data.shape, corners, arms, mattressCount, perSide, mattressLength_m: ml };
  };

  // ----- Calculs (montants gardés internes ; on n'affiche que le total) -----
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

    return { type: "salon", breakdown: { geom }, subtotal, total };
  };

  const calculateCarpetPrice = () => {
    const area = carpetData.length * carpetData.width;
    const subtotal = area * PRICES.carpet.pricePerSqm;
    const deliveryTotal = carpetData.needsDelivery ? PRICES.carpet.delivery : 0;
    const total = subtotal + deliveryTotal;
    return { type: "carpet", breakdown: { area }, subtotal, total };
  };

  const calculateCurtainPrice = () => {
    const area = curtainData.length * curtainData.width;
    const pricePerSqm = PRICES.curtain[curtainData.quality];
    const subtotal = area * pricePerSqm;
    const deliveryTotal = curtainData.needsDelivery ? PRICES.curtain.delivery : 0;
    const total = subtotal + deliveryTotal;
    return { type: "curtain", breakdown: { area, quality: curtainData.quality }, subtotal, total };
  };

  const handleCalculate = () => {
    let result;
    if (activeTab === "salon") result = calculateSalonPrice();
    else if (activeTab === "carpet") result = calculateCarpetPrice();
    else result = calculateCurtainPrice();
    setCalculatedPrice(result);
    toast.success("Calcul effectué.");
  };

  const handleSubmitQuote = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast.error("Veuillez renseigner votre nom et téléphone");
      return;
    }
    if (!calculatedPrice) {
      toast.error("Veuillez d'abord calculer le devis");
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

  /** Pied de page joli, identique à l'accueil */
  const SiteFooter = () => (
    <footer className="mt-20 bg-neutral-950 text-neutral-300">
      <div className="container py-12 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Decor Mali" className="h-10 w-10 rounded-full ring-1 ring-white/20 object-contain" />
            <span className="font-semibold text-lg">Decor Mali</span>
          </div>
          <p className="text-sm text-neutral-400">Salons, tapis & rideaux sur-mesure.</p>
        </div>
        <div className="space-y-2 text-sm"><strong>Contact</strong><div>+223 70 93 24 62</div><div>contact@decormali.com</div></div>
        <div className="space-y-2 text-sm"><strong>Localisation</strong><div>Bamako, Mali</div><div>Toujours ouvert</div></div>
        <div className="space-y-2 text-sm"><strong>Liens</strong><Link href="/">Accueil</Link><Link href="/quote">Devis</Link></div>
      </div>
      <div className="border-top border-white/10">
        <div className="container py-5 text-xs text-neutral-400">© {new Date().getFullYear()} Decor Mali</div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Decor Mali" className="h-8 w-8 rounded-full ring-1 ring-muted object-contain" />
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
            <p className="text-muted-foreground">Le détail des prix est masqué. Nous affichons le total.</p>
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
                      <Checkbox id="smallTable" checked={salonData.hasSmallTable}
                        onCheckedChange={(v) => setSalonData({ ...salonData, hasSmallTable: !!v })} />
                      <Label htmlFor="smallTable">Petite table</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="bigTable" checked={salonData.hasBigTable}
                        onCheckedChange={(v) => setSalonData({ ...salonData, hasBigTable: !!v })} />
                      <Label htmlFor="bigTable">Grande table</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="delivery" checked={salonData.needsDelivery}
                        onCheckedChange={(v) => setSalonData({ ...salonData, needsDelivery: !!v })} />
                      <Label htmlFor="delivery">Livraison</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Résultat</CardTitle>
                  <CardDescription>Dessin des matelas et total du devis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "salon" && (
                    <div className="space-y-6">
                      {/* Schéma */}
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          Forme : {calculatedPrice.breakdown.geom.forme} — Matelas : {calculatedPrice.breakdown.geom.mattressCount} — Coins : {calculatedPrice.breakdown.geom.corners}
                        </div>
                        <SalonDiagram geom={calculatedPrice.breakdown.geom} />
                      </div>

                      {/* Total uniquement (détails cachés) */}
                      <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Détails de prix masqués (matelas, coins, bras, options…)
                        </div>
                        <div className="text-2xl font-extrabold text-orange-700">
                          Total : {formatPrice(calculatedPrice.total)}
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
                      <Checkbox id="carpetDelivery" checked={carpetData.needsDelivery}
                        onCheckedChange={(v) => setCarpetData({ ...carpetData, needsDelivery: !!v })} />
                      <Label htmlFor="carpetDelivery">Livraison</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "carpet" && (
                    <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Surface : {(carpetData.length * carpetData.width).toFixed(2)} m² — détails masqués
                      </div>
                      <div className="text-2xl font-extrabold text-orange-700">
                        Total : {formatPrice(calculatedPrice.total)}
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
                      <Checkbox id="curtainDelivery" checked={curtainData.needsDelivery}
                        onCheckedChange={(v) => setCurtainData({ ...curtainData, needsDelivery: !!v })} />
                      <Label htmlFor="curtainDelivery">Livraison</Label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "curtain" && (
                    <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Surface : {(curtainData.length * curtainData.width).toFixed(2)} m² — détails masqués
                      </div>
                      <div className="text-2xl font-extrabold text-orange-700">
                        Total : {formatPrice(calculatedPrice.total)}
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

      <SiteFooter />
    </div>
  );
}
