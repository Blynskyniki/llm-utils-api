export interface SummarizationProvider {
  summarize(text: string): Promise<string>;
}
