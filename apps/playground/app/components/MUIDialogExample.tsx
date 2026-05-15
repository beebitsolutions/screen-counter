/**
 * Fixture B.3 — MUI Dialog example.
 * Expected: counts as 1 modal. Signal: strong:import:@mui/material (Dialog specifier).
 */
'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useState } from 'react';

export default function MUIDialogExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open MUI Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>MUI Dialog</DialogTitle>
        <DialogContent>Strong signal from @mui/material.</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
