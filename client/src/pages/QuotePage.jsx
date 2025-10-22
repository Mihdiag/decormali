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

/* ------------------ Barèmes internes (masqués dans l'UI) ------------------ */
const PRICES = {
  salon: {
    mattress: 130000,
    corner: 130000,
    arms: 96000,
    smallTable: 50000,
    bigTable: 130000,
    deliveryIncluded: 75000,   // incluse obligatoirement
    transport: 425000,         // ajouté automatiquement
    profitPerSalon: 500000,    // ajouté automatiquement
  },
  carpet: { pricePerSqm: 13000, delivery: 75000 },
  curtain: { dubai: 6000, quality2: 4500, quality3: 4000, delivery: 75000 },
};

// constantes salon
const STD_MATTRESS = 1.9; // m
const MIN_MATTRESS = 1.4; // m

/* ------------------ Dessin SVG ------------------ */
function SalonDiagram({ geom, hasSmallTable, hasBigTable, depth = 0.7 }) {
  /* geom.perSide : [{ id, len, effective, segments: number[] }] */
  const { widthPx, heightPx, scale, rects, coins, tableShapes } = useMemo(() => {
    const sides = geom.perSide;
    const seatDepth = depth; // m

    // Calcul étendue de la scène (approx) en mètres
    let widthM = 2 + (sides.find(s => s.id === "A" || s.id === "Gauche")?.len || 0)
                   + (geom.forme === "U" ? (sides.find(s => s.id === "Central")?.len || 0) : 0);
    let heightM = 2 + (sides.find(s => s.id === "B" || s.id === "Droit")?.len || 0);

    const maxW = 680, maxH = 420;
    const scale = Math.min(maxW / widthM, maxH / heightM);

    const sd = seatDepth * scale;

    const rects = [];
    const coins = [];
    const tableShapes = [];

    // Helpers dessin
    const drawHorizontalSegments = (xStartM, yStartM, segments) => {
      let x = xStartM;
      segments.forEach((seg, i) => {
        rects.push({
          x: x * scale, y: yStartM * scale,
          w: seg * scale, h: sd, label: i + 1
        });
        x += seg;
      });
    };

    const drawVerticalSegments = (xStartM, yStartM, segments) => {
      let y = yStartM;
      segments.forEach((seg, i) => {
        rects.push({
          x: xStartM * scale, y: y * scale,
          w: sd, h: seg * scale, label: i + 1
        });
        y += seg;
      });
    };

    if (geom.forme === "L") {
      const sideA = sides.find(s => s.id === "A");
      const sideB = sides.find(s => s.id === "B");

      // coin 1x1 à l'origine
      coins.push({ x: 0, y: 0, s: 1 * scale });

      // A = horizontal vers la droite depuis le coin
      drawHorizontalSegments(1, 0, sideA?.segments || []);
      // B = vertical vers le bas depuis le coin
      drawVerticalSegments(0, 1, sideB?.segments || []);

      // Tables (centre proche du coin intérieur)
      if (hasSmallTable) {
        tableShapes.push({ type: "small", cx: 1 + Math.min(0.9, (sideA?.effective || 0) / 2), cy: 1 + Math.min(0.9, (sideB?.effective || 0) / 2) });
      }
      if (hasBigTable) {
        tableShapes.push({ type: "big", cx: 1 + Math.min(1.2, (sideA?.effective || 0) / 1.8), cy: 1 + Math.min(1.2, (sideB?.effective || 0) / 1.8) });
      }
    } else {
      const sideG = sides.find(s => s.id === "Gauche");
      const sideC = sides.find(s => s.id === "Central");
      const sideD = sides.find(s => s.id === "Droit");

      // deux coins 1x1 aux extrémités du central
      coins.push({ x: 0, y: 0, s: 1 * scale });
      coins.push({ x: (1 + (sideC?.len || 0)) * scale, y: 0, s: 1 * scale });

      // Central : horizontal entre les coins
      drawHorizontalSegments(1, 0, sideC?.segments || []);
      // Gauche : vertical depuis coin gauche
      drawVerticalSegments(0, 1, sideG?.segments || []);
      // Droit : vertical depuis coin droit
      drawVerticalSegments(1 + (sideC?.len || 0), 1, sideD?.segments || []);

      // Tables : au “centre” du U
      if (hasBigTable) {
        tableShapes.push({ type: "big", cx: 1 + (sideC?.len || 2) / 2, cy: 1 + Math.min(1.3, Math.max(sideG?.effective || 0, sideD?.effective || 0) / 2) });
      }
      if (hasSmallTable) {
        tableShapes.push({ type: "small", cx: 1 + (sideC?.len || 2) / 2.6, cy: 1 + 0.9 });
      }
    }

    // dimensions finales (px)
    const widthPx = Math.min(maxW, widthM * scale + 8);
    const heightPx = Math.min(maxH, heightM * scale + 8);

    return { widthPx, heightPx, scale, rects, coins, tableShapes };
  }, [geom, hasSmallTable, hasBigTable, depth]);

  return (
    <svg width={widthPx} height={heightPx} className="rounded-md bg-orange-50/40 border border-orange-100 mx-auto">
      {/* Coins */}
      {coins.map((c, i) => (
        <rect key={`c-${i}`} x={c.x} y={c.y} width={c.s} height={c.s} fill="#FED7AA" stroke="#FB923C" strokeWidth="2" opacity="0.95" />
      ))}
      {/* Matelas */}
      {rects.map((r, i) => (
        <g key={`m-${i}`}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6" ry="6" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2" />
          <text x={r.x + r.w/2} y={r.y + r.h/2} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#9A3412">
            {r.label}
          </text>
        </g>
      ))}
      {/* Tables */}
      {tableShapes.map((t, i) => {
        const rSmall = 0.30 * 100;  // rayon approximatif en px (échelle fixe pour lisibilité)
        const rBig = 0.45 * 100;
        if (t.type === "small") {
          return (
            <g key={`ts-${i}`} transform={`translate(${t.cx * 100}, ${t.cy * 100})`}>
              <circle r={rSmall} fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" opacity="0.9" />
              <text y="4" textAnchor="middle" fontSize="12" fill="#92400E">Table S</text>
            </g>
          );
        }
        return (
          <g key={`tb-${i}`} transform={`translate(${t.cx * 100}, ${t.cy * 100})`}>
            <rect x={-rBig} y={-rBig} width={2*rBig} height={2*rBig} rx="12" fill="#FDE68A" stroke="#F59E0B" strokeWidth="3" opacity="0.9" />
            <text y="4" textAnchor="middle" fontSize="12" fill="#92400E">Table G</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------ Page Devis ------------------ */
export default function QuotePage() {
  const [activeTab, setActiveTab] = useState("salon");

  // ----- SALON (formes L/U + mètres par côté)
  const [salonData, setSalonData] = useState({
    shape: "L",          // "L" ou "U"
    sideA_m: 4,          // L : côté A / U : côté gauche
    sideB_m: 3,          // L : côté B / U : côté central
    sideC_m: 0,          // U : côté droit
    hasSmallTable: false,
    hasBigTable: false,
  });

  // ----- TAPIS & RIDEAUX (inchangés sauf masquage des détails)
  const [carpetData, setCarpetData] = useState({ length: 3, width: 2 });
  const [curtainData, setCurtainData] = useState({ length: 2.5, width: 3, quality: "dubai" });

  // ----- Client
  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---- Fractionnement matelas avec redistribution si reliquat < 1.40m ---- */
  const splitIntoMattresses = (effectiveLen) => {
    if (effectiveLen <= 0) return [];
    const nFloor = Math.floor(effectiveLen / STD_MATTRESS);
    const remainder = effectiveLen - nFloor * STD_MATTRESS;

    // Cas 1 : une seule pièce entre 1.40 et 1.90
    if (nFloor === 0) {
      if (effectiveLen >= MIN_MATTRESS) return [effectiveLen];
      // Trop court pour un matelas - on ne place rien
      return [];
    }

    // Cas 2 : reste suffisant pour un matelas (>= 1.40)
    if (remainder >= MIN_MATTRESS) {
      return Array(nFloor).fill(STD_MATTRESS).concat([remainder]);
    }

    // Cas 3 : reste < 1.40 => on répartit proportionnellement sur les nFloor matelas
    const addEach = remainder / nFloor;
    return Array.from({ length: nFloor }, () => STD_MATTRESS + addEach);
  };

  // --- Calcul géométrique salon (L/U)
  const calcSalonGeometry = (data) => {
    const COIN_M = 1;

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
      const segments = splitIntoMattresses(effective);
      return { ...s, effective, segments, mattresses: segments.length };
    });

    const corners = isL ? 1 : 2;
    const arms = 2;
    const mattressCount = perSide.reduce((acc, s) => acc + s.mattresses, 0);

    return { forme: data.shape, corners, arms, mattressCount, perSide };
  };

  /* ----- Calculs : on n'affiche que le total ----- */
  const calculateSalonPrice = () => {
    const geom = calcSalonGeometry(salonData);

    const mattressTotal = geom.mattressCount * PRICES.salon.mattress;
    const cornerTotal   = geom.corners       * PRICES.salon.corner;
    const armsTotal     = geom.arms          * PRICES.salon.arms;
    const smallTableTot = salonData.hasSmallTable ? PRICES.salon.smallTable : 0;
    const bigTableTot   = salonData.hasBigTable   ? PRICES.salon.bigTable   : 0;

    // livraison incluse + transport + bénéfice fixes
    const includedDelivery = PRICES.salon.deliveryIncluded;
    const transport        = PRICES.salon.transport;
    const profit           = PRICES.salon.profitPerSalon;

    const subtotal = mattressTotal + cornerTotal + armsTotal + smallTableTot + bigTableTot;
    const total = subtotal + includedDelivery + transport + profit;

    return {
      type: "salon",
      breakdown: { geom }, // détails masqués à l'affichage
      subtotal,
      total,
    };
  };

  const calculateCarpetPrice = () => {
    const area = carpetData.length * carpetData.width;
    const subtotal = area * PRICES.carpet.pricePerSqm;
    const total = subtotal + PRICES.carpet.delivery; // inclure une livraison par défaut ici si souhaité
    return { type: "carpet", breakdown: { area }, subtotal, total };
  };

  const calculateCurtainPrice = () => {
    const area = curtainData.length * curtainData.width;
    const pricePerSqm = PRICES.curtain[curtainData.quality];
    const subtotal = area * pricePerSqm;
    const total = subtotal + PRICES.curtain.delivery;
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

  /* ------------------ UI ------------------ */
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
      <div className="border-t border-white/10">
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
            <p className="text-muted-foreground">
              Le détail des prix est masqué. Livraison 75 000 FCFA et transport 425 000 FCFA sont inclus, ainsi qu’un bénéfice par salon.
            </p>
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
                  {salonData.shape === "L" ? (
                    <div className="grid md:grid-cols-3 gap-6">
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
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-4 gap-6">
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
                    </div>
                  )}

                  {/* Options tables + étiquettes d'inclusion */}
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
                    <div className="text-sm text-muted-foreground">
                      Livraison (75 000) & transport (425 000) inclus automatiquement.
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
                          Forme : {calculatedPrice.breakdown.geom.forme} — Matelas : {calculatedPrice.breakdown.geom.perSide.reduce((n,s)=>n+s.segments.length,0)} — Coins : {calculatedPrice.breakdown.geom.corners}
                        </div>
                        <SalonDiagram
                          geom={calculatedPrice.breakdown.geom}
                          hasSmallTable={salonData.hasSmallTable}
                          hasBigTable={salonData.hasBigTable}
                        />
                      </div>

                      {/* Total uniquement (détails cachés) */}
                      <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Détails de prix masqués (matelas, coins, bras, tables, livraison, transport, bénéfice).
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
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "carpet" && (
                    <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Détails masqués — surface {(carpetData.length * carpetData.width).toFixed(2)} m²
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
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleCalculate} className="gap-2">
                      <Calculator className="w-4 h-4" /> Calculer
                    </Button>
                  </div>

                  {calculatedPrice && calculatedPrice.type === "curtain" && (
                    <div className="rounded-lg bg-orange-50 border border-orange-100 p-4 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Détails masqués — surface {(curtainData.length * curtainData.width).toFixed(2)} m²
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
