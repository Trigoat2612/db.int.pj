export type IntegrationMeta = {
  name: string;
  sourceSheet: string;
  metric: string;
  hasCSJ: boolean;
  hasSede: boolean;
  rows: number;
};

export type RecordRow = {
  integration: string;
  sourceSheet: string;
  year: number;
  csj: string | null;
  sede: string | null;
  organo: string | null;
  cantidad: number;
  tipo_instancia?: string | null;
};

export type DataPayload = {
  generatedAt: string;
  source: string;
  integrations: IntegrationMeta[];
  records: RecordRow[];
};

export type Filters = {
  integration: string;
  years: number[];
  csj: string;
  sede: string;
  organo: string;
};
