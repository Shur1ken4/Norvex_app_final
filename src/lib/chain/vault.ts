"use client";
// Minimal, dependency-light client for the norvex_vault Anchor program.
// Builds the create_vault instruction by hand (hardcoded Anchor discriminator +
// borsh args + PDA derivation) so we don't pull in the heavy @coral-xyz/anchor JS.
// Everything here is OPT-IN: it only runs when NEXT_PUBLIC_VAULT_PROGRAM_ID is set
// and the user explicitly clicks "Deploy on-chain". The app works fully without it.
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, type Connection } from "@solana/web3.js";
import { Buffer } from "buffer";

// sha256("global:create_vault")[0..8]
const CREATE_VAULT_DISC = Uint8Array.from([29, 237, 247, 208, 193, 82, 54, 135]);

function u64le(n: number): Uint8Array {
  const b = new Uint8Array(8);
  new DataView(b.buffer).setBigUint64(0, BigInt(Math.round(n)), true);
  return b;
}
function u16le(n: number): Uint8Array {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}
function concat(arrs: Uint8Array[]): Uint8Array {
  const len = arrs.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const a of arrs) { out.set(a, o); o += a.length; }
  return out;
}

export function vaultProgramId(): PublicKey | null {
  const id = process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID;
  return id ? new PublicKey(id) : null;
}

export const VAULT_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID);

type SendTx = (tx: Transaction, connection: Connection) => Promise<string>;

export async function createVaultOnChain(opts: {
  connection: Connection;
  owner: PublicKey;
  sendTransaction: SendTx;
  id: number;
  amountLamports: number;
  maxDdBps: number;
  growthLamports: number;
}): Promise<string> {
  const programId = vaultProgramId();
  if (!programId) throw new Error("Vault program not configured");
  const idSeed = Buffer.from(u64le(opts.id));
  const ownerBuf = opts.owner.toBuffer();
  const [portfolio] = PublicKey.findProgramAddressSync([Buffer.from("portfolio"), ownerBuf, idSeed], programId);
  const [safe] = PublicKey.findProgramAddressSync([Buffer.from("safe"), ownerBuf, idSeed], programId);
  const [growth] = PublicKey.findProgramAddressSync([Buffer.from("growth"), ownerBuf, idSeed], programId);

  const data = Buffer.from(concat([
    CREATE_VAULT_DISC,
    u64le(opts.id),
    u64le(opts.amountLamports),
    u16le(opts.maxDdBps),
    u64le(opts.growthLamports),
  ]));

  const ix = new TransactionInstruction({
    programId,
    keys: [
      { pubkey: opts.owner, isSigner: true, isWritable: true },
      { pubkey: portfolio, isSigner: false, isWritable: true },
      { pubkey: safe, isSigner: false, isWritable: true },
      { pubkey: growth, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  const tx = new Transaction().add(ix);
  const sig = await opts.sendTransaction(tx, opts.connection);
  await opts.connection.confirmTransaction(sig, "confirmed");
  return sig;
}

export function explorerTxUrl(sig: string): string {
  return `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
}
