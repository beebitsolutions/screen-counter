/**
 * Fixture B.4 — Chakra UI Modal example.
 * Expected: counts as 1 modal. Signal: strong:import:@chakra-ui/react (Modal specifier).
 */
'use client';

import {
  Button,
  ChakraProvider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useState } from 'react';

export default function ChakraModalExample() {
  const [open, setOpen] = useState(false);
  return (
    <ChakraProvider>
      <Button onClick={() => setOpen(true)}>Open Chakra Modal</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Chakra Modal</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Strong signal from @chakra-ui/react.</ModalBody>
          <ModalFooter>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
}
