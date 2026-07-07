export interface DetailsList {
  title: string;
  items: string[];
}

export interface DiagramValidationErrorParams {
  header: string;
  issue: string;
  detailsList?: DetailsList;
  suggestion?: string;
  suggestionLabel?: string;
  details?: unknown;
}

export class DiagramValidationError extends Error {
  issue: string;
  suggestion?: string;
  details?: unknown;

  constructor(params: DiagramValidationErrorParams) {
    const lines = [params.header, params.issue];

    if (params.detailsList) {
      lines.push(
        '',
        params.detailsList.title,
        ...params.detailsList.items.map((i) => (i.startsWith('-') ? i : `- ${i}`)),
      );
    }

    if (params.suggestion) {
      lines.push('', params.suggestionLabel ?? 'Sugerencia:', params.suggestion);
    }

    super(lines.join('\n'));
    this.name = 'DiagramValidationError';
    this.issue = params.issue;
    this.suggestion = params.suggestion;
    this.details = params.details;
  }
}
