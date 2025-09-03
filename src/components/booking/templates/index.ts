import TemplateA from './TemplateA';
import TemplateB from './TemplateB';
import TemplateC from './TemplateC';

export { type TemplateProps } from './types';

export const templates = {
  templateA: TemplateA,
  templateB: TemplateB,
  templateC: TemplateC,
} as const;

export type TemplateId = keyof typeof templates;
