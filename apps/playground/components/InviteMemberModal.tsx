/**
 * Fixture B.4 — InviteMemberModal (formerly ChakraModalExample).
 * Expected: counts as 1 modal.
 * Signals: strong:import:@chakra-ui/react (Modal) + weak:name-suffix:Modal.
 * Real-world use: invite a teammate to a project from the project row actions.
 */
'use client';

import {
  ChakraProvider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  projectName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: string) => void;
};

export default function InviteMemberModal({ projectName, open, onOpenChange, onInvite }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes('@')) return;
    onInvite(email, role);
    setEmail('');
    onOpenChange(false);
  }

  // Chakra v2 + React 19 crashes during dashboard hydration when ChakraProvider
  // lives in the layout. Self-contain it here so it only initializes when this
  // modal is mounted (which only happens once an "Invite member" action runs).
  return (
    <ChakraProvider>
      <Modal isOpen={open} onClose={() => onOpenChange(false)} isCentered size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invitar miembro a {projectName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="invite-form" onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email">Dirección de email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="invite-role">Rol</Label>
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Lector</option>
                </select>
              </div>
            </form>
          </ModalBody>
          <ModalFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button form="invite-form" type="submit" size="sm">
              Enviar invitación
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
}
