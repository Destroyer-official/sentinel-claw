import dotenv from 'dotenv';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

dotenv.config();

// Safety Check
if (!process.env.PRIVATE_KEY) {
  throw new Error("❌ PRIVATE_KEY missing in .env file");
}

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.RPC_URL || "https://mainnet.base.org")
});

export const CONFIG = {
  AGENT_NAME: "SentinelClaw",
  // The 'Persona' is critical for the LLM
  SYSTEM_PROMPT: `You are SentinelClaw, an autonomous VC agent on Base.
  You value SECURITY above all else.
  You look for 'Human Speed' deployments and active social histories.
  You REJECT 'Machine Speed' rugs.`,
  THRESHOLDS: {
    MIN_SCORE: 8, // Out of 10
    TIMELOCK_MIN_SECONDS: 180 // 3 minutes
  }
};

console.log(`🔌 Wallet Connected: ${account.address}`);
