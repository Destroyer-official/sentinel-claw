import { OpenClawAgent } from './core/agent';
import { ScannerSkill } from './skills/scanner';

async function main() {
  const sentinel = new OpenClawAgent();

  // Register Skills
  sentinel.registerSkill(new ScannerSkill());

  // Start
  await sentinel.start();
}

main().catch(console.error);
