import { readdirSync, readFileSync } from 'fs';
import path from 'path';

export function getAgentDir({ agentDir }: { agentDir: string }) {
  const ARK_APP_DIR = process.env.ARK_APP_DIR || process.cwd();
  return path.join(ARK_APP_DIR, agentDir);
}

export function listAgentsJson({ agentDir }: { agentDir: string }) {
  try {
    const agentDirPath = getAgentDir({ agentDir });
    const agents = readdirSync(agentDirPath);
    return agents;
  } catch (e) {
    console.error('No agent directory found:', agentDir);
    return;
  }
}

export function getAgentFile(agentFilePath: string) {
  try {
    const fileP = agentFilePath;
    const fileB = readFileSync(fileP, 'utf8');
    const json = JSON.parse(fileB);
    return json;
  } catch (e) {
    console.error('No agent blueprint found:', agentFilePath);
    return;
  }
}

export function getAgentBlueprint({
  agentId,
  agentDir,
}: {
  agentId: string;
  agentDir: string;
}) {
  const agentDirPath = getAgentDir({ agentDir });
  const agentBlueprintPath = path.join(agentDirPath, `${agentId}.json`);
  return getAgentFile(agentBlueprintPath);
}