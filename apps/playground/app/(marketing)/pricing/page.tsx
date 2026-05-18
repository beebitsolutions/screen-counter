/**
 * Fixture A.6 — Pricing page (route group `(marketing)`).
 * Expected: counts as 1 route. Route: /pricing (the route group does not appear in the URL).
 */
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicShell } from '@/components/public-shell';

type Tier = {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: readonly string[];
  highlighted?: boolean;
};

const TIERS: readonly Tier[] = [
  {
    name: 'Gratis',
    price: '0 €',
    cadence: 'para siempre',
    description: 'Prueba ProjectHub con hasta 3 proyectos.',
    features: ['Hasta 3 proyectos', '1 plaza de administrador', 'Soporte de la comunidad'],
  },
  {
    name: 'Pro',
    price: '24 €',
    cadence: 'por plaza / mes',
    description: 'Para equipos pequeños que entregan de forma continua.',
    features: [
      'Proyectos ilimitados',
      'Hasta 25 plazas',
      'Actividad e informes',
      'Soporte prioritario por email',
    ],
    highlighted: true,
  },
  {
    name: 'Empresa',
    price: 'Personalizado',
    cadence: 'hablemos',
    description: 'SSO, registros de auditoría y onboarding a medida.',
    features: [
      'SSO + SCIM',
      'Exportación de registros de auditoría',
      'CSM dedicado',
      'Contratos a medida',
    ],
  },
];

export default function PricingPage() {
  return (
    <PublicShell>
      <header className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Precios sencillos y predecibles
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Elige el plan que mejor encaje con el equipo que tienes hoy.
        </p>
      </header>
      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <Card key={tier.name} className={tier.highlighted ? 'border-primary shadow-lg' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <p className="mt-4">
                <span className="text-3xl font-semibold text-foreground">{tier.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">{tier.cadence}</span>
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button disabled className="w-full" variant={tier.highlighted ? 'default' : 'outline'}>
                Próximamente
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </PublicShell>
  );
}
