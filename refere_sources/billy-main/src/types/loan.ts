export interface Loan {
  id: string;
  borrowerName: string; // 빌려간 사람 이름
  amount: number; // 금액
  interestRate: number; // 이자율 (기본 0%)
  loanDate: string; // 빌려준 날짜 (ISO string)
  dueDate?: string; // 갚기로 한 날짜 (선택)
  memo?: string; // 메모
  photos: string[]; // Base64 이미지 배열
  isPaidBack: boolean; // 상환 완료 여부
  paidBackDate?: string; // 상환 완료 날짜
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanInput {
  borrowerName: string;
  amount: number;
  interestRate?: number;
  loanDate: string;
  dueDate?: string;
  memo?: string;
  photos?: string[];
}
