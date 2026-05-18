/**
 * Fixture A.7 — Contact page (route group `(marketing)`).
 * Expected: counts as 1 route. Route: /contact (the route group does not appear in the URL).
 */
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PublicShell } from '@/components/public-shell';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Contacta con nosotros</h1>
        <p className="mt-3 text-base text-muted-foreground">
          Nos encantará saber de ti. Este formulario es una demo y no envía nada a ningún sitio.
        </p>
        {submitted ? (
          <div className="mt-8 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
            ¡Gracias! Te responderemos pronto (en una app de verdad, claro).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Nombre</Label>
              <Input id="contact-name" required placeholder="María García" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Email</Label>
              <Input id="contact-email" type="email" required placeholder="maria@empresa.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-message">Mensaje</Label>
              <Textarea id="contact-message" required rows={5} placeholder="¿En qué podemos ayudarte?" />
            </div>
            <Button type="submit">Enviar mensaje</Button>
          </form>
        )}
      </div>
    </PublicShell>
  );
}
