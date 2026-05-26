import { TransactionStatus } from '../../types/enums.js';

interface Transition {
  from: TransactionStatus;
  to: TransactionStatus[];
}

export const TRANSITION_MAP: Transition[] = [
  { from: TransactionStatus.PENDING, to: [TransactionStatus.PROCESSING, TransactionStatus.CANCELLED] },
  { from: TransactionStatus.PROCESSING, to: [TransactionStatus.SUCCESS, TransactionStatus.FAILED, TransactionStatus.REFUNDED] },
  { from: TransactionStatus.SUCCESS, to: [TransactionStatus.REFUNDED] },
  { from: TransactionStatus.FAILED, to: [TransactionStatus.PENDING] },
  { from: TransactionStatus.REFUNDED, to: [] },
  { from: TransactionStatus.CANCELLED, to: [] },
  { from: TransactionStatus.EXPIRED, to: [] },
];

export function canTransition(from: TransactionStatus, to: TransactionStatus): boolean {
  const rule = TRANSITION_MAP.find((t) => t.from === from);
  if (!rule) return false;
  return rule.to.includes(to);
}

export function assertCanTransition(from: TransactionStatus, to: TransactionStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid state transition: ${from} -> ${to}`);
  }
}
