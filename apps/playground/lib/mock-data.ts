export type ProjectStatus = 'active' | 'archived' | 'paused';

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  owner: string;
  description: string;
  updatedAt: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar: string;
};

export type ActivityEvent = {
  id: string;
  projectId: string;
  type: 'created' | 'updated' | 'archived' | 'invited' | 'commented';
  actor: string;
  when: string;
  summary: string;
};

export type Report = {
  slug: string;
  title: string;
  period: string;
  summary: string;
};

// Display labels keep internal enum values (`active`, `admin`, …) in English so
// equality checks elsewhere stay simple; only the user-visible text is in
// Spanish.
export const statusLabel: Record<ProjectStatus, string> = {
  active: 'Activo',
  paused: 'En pausa',
  archived: 'Archivado',
};

export const roleLabel: Record<Member['role'], string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Lector',
};

export const activityTypeLabel: Record<ActivityEvent['type'], string> = {
  created: 'Creado',
  updated: 'Actualizado',
  archived: 'Archivado',
  invited: 'Invitación',
  commented: 'Comentario',
};

export const mockProjects: Project[] = [
  {
    id: 'p-001',
    name: 'Rediseño de la web',
    status: 'active',
    owner: 'Ana López',
    description:
      'Renovación de la web pública con el nuevo sistema de diseño.',
    updatedAt: '2026-04-22',
  },
  {
    id: 'p-002',
    name: 'API v3',
    status: 'paused',
    owner: 'Bea Ruiz',
    description:
      'API REST versionada que sustituye a la capa de GraphQL antigua.',
    updatedAt: '2026-03-14',
  },
  {
    id: 'p-003',
    name: 'Lanzamiento de la app móvil',
    status: 'active',
    owner: 'Carlos Vega',
    description: 'Salida en iOS y Android, incluyendo modo offline.',
    updatedAt: '2026-05-02',
  },
  {
    id: 'p-004',
    name: 'Migración del data warehouse',
    status: 'archived',
    owner: 'Diana Soto',
    description:
      'Desmantelar el clúster heredado de Redshift y migrar a BigQuery.',
    updatedAt: '2025-12-09',
  },
  {
    id: 'p-005',
    name: 'Flujo de onboarding de clientes',
    status: 'active',
    owner: 'Elena Marín',
    description: 'Nuevo recorrido guiado y asistente de configuración autoservicio.',
    updatedAt: '2026-05-10',
  },
  {
    id: 'p-006',
    name: 'Rediseño de facturación',
    status: 'paused',
    owner: 'Félix Roma',
    description:
      'Migrar de Stripe Checkout a Stripe Elements por requisitos fiscales.',
    updatedAt: '2026-02-28',
  },
  {
    id: 'p-007',
    name: 'Base de conocimiento de soporte',
    status: 'active',
    owner: 'Gabriela Iglesias',
    description: 'Portal público de documentación con guías versionadas.',
    updatedAt: '2026-04-30',
  },
  {
    id: 'p-008',
    name: 'Panel interno de analítica',
    status: 'archived',
    owner: 'Héctor Bello',
    description: 'Retirado en favor de los nuevos cuadros de Looker.',
    updatedAt: '2025-11-17',
  },
];

export const mockMembers: Member[] = [
  { id: 'u-001', name: 'Ana López', email: 'ana@projecthub.test', role: 'admin', avatar: 'AL' },
  { id: 'u-002', name: 'Bea Ruiz', email: 'bea@projecthub.test', role: 'editor', avatar: 'BR' },
  { id: 'u-003', name: 'Carlos Vega', email: 'carlos@projecthub.test', role: 'editor', avatar: 'CV' },
  { id: 'u-004', name: 'Diana Soto', email: 'diana@projecthub.test', role: 'viewer', avatar: 'DS' },
  { id: 'u-005', name: 'Elena Marín', email: 'elena@projecthub.test', role: 'admin', avatar: 'EM' },
];

export const mockActivity: ActivityEvent[] = [
  { id: 'a-001', projectId: 'p-001', type: 'updated', actor: 'Ana López', when: '2026-05-15 09:14', summary: 'actualizó la descripción del proyecto' },
  { id: 'a-002', projectId: 'p-003', type: 'created', actor: 'Carlos Vega', when: '2026-05-14 17:42', summary: 'creó el hito «Lanzamiento beta»' },
  { id: 'a-003', projectId: 'p-005', type: 'invited', actor: 'Elena Marín', when: '2026-05-14 11:08', summary: 'invitó a bea@projecthub.test como editor' },
  { id: 'a-004', projectId: 'p-002', type: 'commented', actor: 'Bea Ruiz', when: '2026-05-13 16:30', summary: 'comentó sobre el plan de despliegue' },
  { id: 'a-005', projectId: 'p-007', type: 'updated', actor: 'Gabriela Iglesias', when: '2026-05-13 10:22', summary: 'cambió el estado a activo' },
  { id: 'a-006', projectId: 'p-001', type: 'commented', actor: 'Carlos Vega', when: '2026-05-12 18:11', summary: 'dejó feedback sobre los nuevos tokens de color' },
  { id: 'a-007', projectId: 'p-006', type: 'archived', actor: 'Félix Roma', when: '2026-05-11 14:04', summary: 'pausó el proyecto pendiente de revisión legal' },
  { id: 'a-008', projectId: 'p-005', type: 'updated', actor: 'Elena Marín', when: '2026-05-10 09:55', summary: 'lanzó el flujo de onboarding v2' },
  { id: 'a-009', projectId: 'p-003', type: 'invited', actor: 'Carlos Vega', when: '2026-05-09 21:31', summary: 'invitó a diana@projecthub.test como lector' },
  { id: 'a-010', projectId: 'p-007', type: 'updated', actor: 'Gabriela Iglesias', when: '2026-05-08 12:00', summary: 'publicó la guía de migración a React 19' },
];

export const mockReports: Report[] = [
  {
    slug: 'weekly',
    title: 'Resumen semanal',
    period: 'Del 12 al 18 de mayo de 2026',
    summary: '12 cambios en 7 proyectos, 3 nuevas incorporaciones al equipo.',
  },
  {
    slug: 'monthly',
    title: 'Resumen mensual',
    period: 'Abril de 2026',
    summary: '4 proyectos completados, 1 archivado, tiempo medio de ciclo de 8,4 días.',
  },
  {
    slug: 'utilization',
    title: 'Utilización del equipo',
    period: 'Q2 2026 (hasta la fecha)',
    summary: 'Diseño al 78 %, ingeniería al 91 %, PMs al 65 %.',
  },
  {
    slug: 'churn',
    title: 'Bajas de proyecto',
    period: 'Últimos 90 días',
    summary: '2 proyectos pausados, 1 archivado. Mayormente por cumplimiento.',
  },
];

export const projectStats = {
  total: mockProjects.length,
  active: mockProjects.filter((p) => p.status === 'active').length,
  archived: mockProjects.filter((p) => p.status === 'archived').length,
  paused: mockProjects.filter((p) => p.status === 'paused').length,
  members: mockMembers.length,
};
