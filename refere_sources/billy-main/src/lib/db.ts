import type { Loan, CreateLoanInput } from '../types/loan';

const DB_NAME = 'billy-db';
const DB_VERSION = 1;
const STORE_NAME = 'loans';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('borrowerName', 'borrowerName', { unique: false });
        store.createIndex('loanDate', 'loanDate', { unique: false });
        store.createIndex('isPaidBack', 'isPaidBack', { unique: false });
      }
    };
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function createLoan(input: CreateLoanInput): Promise<Loan> {
  const db = await openDB();
  const now = new Date().toISOString();

  const loan: Loan = {
    id: generateId(),
    borrowerName: input.borrowerName,
    amount: input.amount,
    interestRate: input.interestRate ?? 0,
    loanDate: input.loanDate,
    dueDate: input.dueDate,
    memo: input.memo,
    photos: input.photos ?? [],
    isPaidBack: false,
    createdAt: now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(loan);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(loan);
  });
}

export async function getAllLoans(): Promise<Loan[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const loans = request.result as Loan[];
      // 최신순 정렬
      loans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      resolve(loans);
    };
  });
}

export async function getLoan(id: string): Promise<Loan | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result ?? null);
  });
}

export async function updateLoan(id: string, updates: Partial<Loan>): Promise<Loan> {
  const db = await openDB();
  const existing = await getLoan(id);

  if (!existing) {
    throw new Error('Loan not found');
  }

  const updated: Loan = {
    ...existing,
    ...updates,
    id: existing.id, // ID는 변경 불가
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(updated);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(updated);
  });
}

export async function deleteLoan(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function markAsPaidBack(id: string): Promise<Loan> {
  return updateLoan(id, {
    isPaidBack: true,
    paidBackDate: new Date().toISOString(),
  });
}

// 통계 함수들
export async function getTotalLentAmount(): Promise<number> {
  const loans = await getAllLoans();
  return loans
    .filter((loan) => !loan.isPaidBack)
    .reduce((sum, loan) => sum + loan.amount, 0);
}

export async function getTotalPaidBackAmount(): Promise<number> {
  const loans = await getAllLoans();
  return loans
    .filter((loan) => loan.isPaidBack)
    .reduce((sum, loan) => sum + loan.amount, 0);
}
