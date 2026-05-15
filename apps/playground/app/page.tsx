/**
 * Fixture A.1 — Home page.
 * Expected: counts as 1 route. Route: /.
 *
 * Doubles as the visual index for every fixture in the playground: routes are
 * rendered as `<Link>`s; modal examples are rendered with their own triggers.
 */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { VERSION } from '@beebit/screen-counter';
import RadixDialogExample from './components/RadixDialogExample';
import HeadlessUIDialogExample from './components/HeadlessUIDialogExample';
import MUIDialogExample from './components/MUIDialogExample';
import ChakraModalExample from './components/ChakraModalExample';
import VaulDrawerExample from './components/VaulDrawerExample';
import HomemadeModal from './components/HomemadeModal';
import SoloPortalToast from './components/SoloPortalToast';
import LoginModalProvider from './components/LoginModalProvider';
import NestedModal from './components/NestedModal';
import ForcedInclude from './components/ForcedInclude';
import ForcedExclude from './components/ForcedExclude';
import {
  Dialog as ShadcnDialog,
  DialogClose as ShadcnDialogClose,
  DialogContent as ShadcnDialogContent,
  DialogTrigger as ShadcnDialogTrigger,
} from '@/components/ui/dialog';

const routes: Array<{ id: string; href: string; label: string; expectation: string }> = [
  { id: 'A.1', href: '/', label: '/', expectation: 'home (this page) — counts as 1' },
  { id: 'A.2', href: '/about', label: '/about', expectation: 'static — counts as 1' },
  { id: 'A.3', href: '/users/42', label: '/users/[id]', expectation: 'dynamic — counts as 1' },
  { id: 'A.4', href: '/blog/2024/release', label: '/blog/[...slug]', expectation: 'catch-all — counts as 1' },
  { id: 'A.5', href: '/docs', label: '/docs/[[...slug]]', expectation: 'optional catch-all — counts as 1' },
  { id: 'A.6', href: '/landing', label: '/landing  (marketing group)', expectation: 'route group — counts as 1' },
  { id: 'A.7', href: '/contact', label: '/contact  (marketing group)', expectation: 'route group — counts as 1' },
  { id: 'A.8', href: '/dashboard', label: '/dashboard', expectation: 'static — counts as 1 (layout/loading/error/not-found alongside DO NOT count)' },
];

const blockTitleStyle = {
  borderTop: '1px solid #e5e7eb',
  marginTop: '2rem',
  paddingTop: '1rem',
};

const itemStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.25rem',
  padding: '0.5rem 0',
  borderBottom: '1px dashed #f3f4f6',
};

const idTagStyle = {
  display: 'inline-block',
  fontFamily: 'ui-monospace, monospace',
  fontSize: '0.8rem',
  background: '#f3f4f6',
  padding: '0.1rem 0.4rem',
  borderRadius: '4px',
  marginRight: '0.5rem',
};

function ShadcnDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <ShadcnDialog open={open} onOpenChange={setOpen}>
      <ShadcnDialogTrigger asChild>
        <button type="button">Open Shadcn-pattern Dialog</button>
      </ShadcnDialogTrigger>
      <ShadcnDialogContent>
        <h3 style={{ marginTop: 0 }}>Shadcn-pattern Dialog</h3>
        <p>
          Detected via <code>path:shadcn-ui</code> on{' '}
          <code>components/ui/dialog.tsx</code>.
        </p>
        <ShadcnDialogClose asChild>
          <button type="button">Close</button>
        </ShadcnDialogClose>
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
}

export default function HomePage() {
  return (
    <main style={{ maxWidth: '64ch' }}>
      <h1>screen-counter playground</h1>
      <p>
        Linked against <code>@beebit/screen-counter</code> v{VERSION}. The badge
        in the top-right is auto-injected by the plugin and reads the analyzer
        result from the virtual runtime module.
      </p>

      <h2 style={blockTitleStyle}>Block A — Routes (8 expected)</h2>
      <p>Every entry below is a real route. The five non-counted Next.js special files (layout/loading/error/not-found/api) live alongside them.</p>
      {routes.map((r) => (
        <div key={r.id} style={itemStyle}>
          <div>
            <span style={idTagStyle}>{r.id}</span>
            <Link href={r.href}>{r.label}</Link>
          </div>
          <small style={{ color: '#6b7280' }}>{r.expectation}</small>
        </div>
      ))}

      <h2 style={blockTitleStyle}>Block B — Modals by library (6 expected)</h2>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>B.1</span>
          <RadixDialogExample />
        </div>
        <small style={{ color: '#6b7280' }}>strong:import:@radix-ui/react-dialog</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>B.2</span>
          <HeadlessUIDialogExample />
        </div>
        <small style={{ color: '#6b7280' }}>strong:import:@headlessui/react (Dialog)</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>B.3</span>
          <MUIDialogExample />
        </div>
        <small style={{ color: '#6b7280' }}>strong:import:@mui/material (Dialog)</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>B.4</span>
          <ChakraModalExample />
        </div>
        <small style={{ color: '#6b7280' }}>strong:import:@chakra-ui/react (Modal)</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>B.5</span>
          <VaulDrawerExample />
        </div>
        <small style={{ color: '#6b7280' }}>strong:import:vaul</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>B.6</span>
          <ShadcnDialogDemo />
        </div>
        <small style={{ color: '#6b7280' }}>strong:path:shadcn-ui (components/ui/dialog.tsx)</small>
      </div>

      <h2 style={blockTitleStyle}>Block C — Homemade & edge cases (2 modals expected)</h2>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>C.1</span>
          <HomemadeModal />
        </div>
        <small style={{ color: '#6b7280' }}>counts: strong:jsx-attr:role=dialog (+ weak suffix + portal)</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>C.2</span>
          <SoloPortalToast />
        </div>
        <small style={{ color: '#6b7280' }}>does NOT count: 1 weak signal (createPortal) — under threshold</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>C.3</span>
          <LoginModalProvider />
        </div>
        <small style={{ color: '#6b7280' }}>
          does NOT count: Provider suffix excluded (overrides scoring + escape hatches)
        </small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>C.4</span>
          <span style={{ color: '#6b7280' }}>AppContext.tsx (not rendered here)</span>
        </div>
        <small style={{ color: '#6b7280' }}>does NOT count: Context suffix excluded</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>C.5</span>
          <NestedModal />
        </div>
        <small style={{ color: '#6b7280' }}>counts as 1: nesting does not double-count (per-definition)</small>
      </div>

      <h2 style={blockTitleStyle}>Block D — Escape hatches (1 modal + 1 disabled)</h2>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>D.1</span>
          <ForcedInclude />
        </div>
        <small style={{ color: '#6b7280' }}>counts: escape-hatch:screen (forced)</small>
      </div>
      <div style={itemStyle}>
        <div>
          <span style={idTagStyle}>D.2</span>
          <ForcedExclude />
        </div>
        <small style={{ color: '#6b7280' }}>does NOT count: escape-hatch:disable (lands in disabled[])</small>
      </div>

      <h2 style={blockTitleStyle}>Total expected</h2>
      <p>
        8 routes + 6 (B) + 2 (C) + 1 (D) = <strong>17 screens</strong>. Plus
        1 disabled entry (D.2). The badge should read{' '}
        <code>17 / NEXT_PUBLIC_SCREEN_COUNTER_LIMIT</code>.
      </p>
    </main>
  );
}
