import { repositories } from "../repositories";

export function getReportsService() {
  return {
    generatedAt: new Date().toISOString(),
    summary: repositories.getDashboard()
  };
}
