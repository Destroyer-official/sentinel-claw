import dotenv from 'dotenv';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';

dotenv.config();

// 1. Get the raw key
const rawKey = process.env.PRIVATE_KEY;

if (!rawKey) {
  throw new Error("❌ PRIVATE_KEY missing in .env file");
}

// 2. Fix the format (Add '0x' if missing)
const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;

// 3. Simple Validation (Hex keys are usually 66 chars long including 0x)
if (formattedKey.length !== 66) {
    console.warn(`⚠️ Warning: Private Key length is ${formattedKey.length}. Expected 66. Double check your .env file.`);
}

// 4. Create Account
const account = privateKeyToAccount(formattedKey as `0x${string}`);

export const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(process.env.RPC_URL || "https://mainnet.base.org")
});

export const CONFIG = {
  AGENT_NAME: "SentinelClaw",
  SYSTEM_PROMPT: `You are SentinelClaw, an autonomous VC agent on Base.
  You value SECURITY above all else.
  You REJECT 'Machine Speed' rugs.`,
  THRESHOLDS: {
    MIN_SCORE: 8,
    TIMELOCK_MIN_SECONDS: 180
  }
};

console.log(`🔌 Wallet Connected: ${account.address}`);
