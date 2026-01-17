import { jsPDF } from 'jspdf';
import type { Loan } from '../types/loan';

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

const getDaysSince = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
};

// Canvas에 텍스트를 그리는 헬퍼 함수
const drawText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    align?: CanvasTextAlign;
  }
) => {
  const { fontSize = 14, fontWeight = 'normal', color = '#191F28', align = 'left' } = options || {};
  ctx.font = `${fontWeight} ${fontSize}px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
};

export async function generateLoanPDF(loan: Loan): Promise<Blob> {
  const pageWidth = 210; // A4 width in mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // 먼저 이미지들 로드하여 전체 높이 계산
  const loadedImages: { img: HTMLImageElement; width: number; height: number }[] = [];
  let totalPhotoHeight = 0;

  for (const photo of loan.photos) {
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = photo;
      });
      const aspectRatio = img.width / img.height;
      const imgWidth = contentWidth;
      const imgHeight = imgWidth / aspectRatio;
      loadedImages.push({ img, width: imgWidth, height: imgHeight });
      totalPhotoHeight += imgHeight + 5;
    } catch (e) {
      console.error('이미지 로드 실패:', e);
    }
  }

  // 텍스트 영역 높이 계산
  let textAreaHeight = 160; // 기본 높이
  textAreaHeight += 16; // 이자율 항상 표시
  if (loan.interestRate > 0) textAreaHeight += 16; // 발생 이자
  if (loan.dueDate) textAreaHeight += 16;
  if (loan.paidBackDate) textAreaHeight += 16;
  if (loan.memo) textAreaHeight += 20;

  // 전체 페이지 높이 = 텍스트 + 사진들 + 여백
  const totalPageHeight = textAreaHeight + totalPhotoHeight + 20;

  // 커스텀 크기 PDF 생성
  const pdf = new jsPDF('p', 'mm', [pageWidth, totalPageHeight]);

  const scale = 2;
  const canvasWidth = pageWidth * scale * 3.78;
  const canvasHeight = textAreaHeight * scale * 3.78;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const px = (mm: number) => mm * scale * 3.78;
  let y = 15;

  // 제목
  drawText(ctx, '빌리 - 대출 기록', px(pageWidth / 2), px(y + 10), {
    fontSize: px(10),
    fontWeight: 'bold',
    align: 'center',
  });
  y += 22;

  // 구분선
  ctx.strokeStyle = '#E5E8EB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px(margin), px(y));
  ctx.lineTo(px(pageWidth - margin), px(y));
  ctx.stroke();
  y += 14;

  // 이름
  drawText(ctx, loan.borrowerName, px(margin), px(y + 10), {
    fontSize: px(10),
    fontWeight: 'bold',
  });
  y += 18;

  // 금액
  drawText(ctx, `${formatAmount(loan.amount)}원`, px(margin), px(y + 14), {
    fontSize: px(14),
    fontWeight: 'bold',
    color: '#3182F6',
  });
  y += 24;

  // 상태 뱃지
  const statusText = loan.isPaidBack ? '상환 완료' : `${getDaysSince(loan.loanDate)}일째 미상환`;
  const statusColor = loan.isPaidBack ? '#00C471' : '#F04452';
  const statusBgColor = loan.isPaidBack ? '#E8F9F0' : '#FFF0F1';

  ctx.fillStyle = statusBgColor;
  const badgeWidth = px(40);
  const badgeHeight = px(10);
  const badgeX = px(margin);
  const badgeY = px(y);
  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, px(2.5));
  ctx.fill();

  drawText(ctx, statusText, badgeX + badgeWidth / 2, badgeY + badgeHeight * 0.7, {
    fontSize: px(6),
    fontWeight: '600',
    color: statusColor,
    align: 'center',
  });
  y += 20;

  // 정보 박스
  const infoBoxY = y;
  let infoBoxHeight = 44 + 16; // 기본 + 이자율
  if (loan.interestRate > 0) infoBoxHeight += 16; // 발생이자
  if (loan.dueDate) infoBoxHeight += 16;
  if (loan.paidBackDate) infoBoxHeight += 16;
  if (loan.memo) infoBoxHeight += 18;

  ctx.fillStyle = '#F4F5F7';
  ctx.beginPath();
  ctx.roundRect(px(margin), px(infoBoxY), px(contentWidth), px(infoBoxHeight), px(3));
  ctx.fill();

  y += 14;

  // 빌려준 날
  drawText(ctx, '빌려준 날', px(margin + 6), px(y + 7), { fontSize: px(7), color: '#6B7684' });
  drawText(ctx, formatDate(loan.loanDate), px(pageWidth - margin - 6), px(y + 7), {
    fontSize: px(7),
    fontWeight: '500',
    align: 'right',
  });
  y += 16;

  // 이자율 (항상 표시)
  drawText(ctx, '연 이자', px(margin + 6), px(y + 7), { fontSize: px(7), color: '#6B7684' });
  drawText(ctx, `${loan.interestRate}%`, px(pageWidth - margin - 6), px(y + 7), {
    fontSize: px(7),
    fontWeight: '500',
    align: 'right',
  });
  y += 16;

  // 발생 이자 (이자율 > 0인 경우만)
  if (loan.interestRate > 0) {
    const daysSince = getDaysSince(loan.loanDate);
    const accruedInterest = Math.floor(loan.amount * (loan.interestRate / 100) * (daysSince / 365));

    drawText(ctx, `발생 이자 (${daysSince}일)`, px(margin + 6), px(y + 7), { fontSize: px(7), color: '#6B7684' });
    drawText(ctx, `${formatAmount(accruedInterest)}원`, px(pageWidth - margin - 6), px(y + 7), {
      fontSize: px(7),
      fontWeight: '500',
      color: '#F04452',
      align: 'right',
    });
    y += 16;
  }

  if (loan.dueDate) {
    drawText(ctx, '갚기로 한 날', px(margin + 6), px(y + 7), { fontSize: px(7), color: '#6B7684' });
    drawText(ctx, formatDate(loan.dueDate), px(pageWidth - margin - 6), px(y + 7), {
      fontSize: px(7),
      fontWeight: '500',
      align: 'right',
    });
    y += 16;
  }

  if (loan.paidBackDate) {
    drawText(ctx, '상환 완료일', px(margin + 6), px(y + 7), { fontSize: px(7), color: '#6B7684' });
    drawText(ctx, formatDate(loan.paidBackDate), px(pageWidth - margin - 6), px(y + 7), {
      fontSize: px(7),
      fontWeight: '500',
      align: 'right',
    });
    y += 16;
  }

  if (loan.memo) {
    drawText(ctx, '메모: ' + loan.memo, px(margin + 6), px(y + 7), { fontSize: px(7) });
  }

  // 첫 페이지에 텍스트 캔버스 추가
  const textData = canvas.toDataURL('image/jpeg', 0.9);
  pdf.addImage(textData, 'JPEG', 0, 0, pageWidth, textAreaHeight);

  // 증거사진 - 미리 로드한 이미지 사용
  if (loadedImages.length > 0) {
    let photoY = textAreaHeight + 5;

    for (let i = 0; i < loadedImages.length; i++) {
      const { width, height } = loadedImages[i];
      const photo = loan.photos[i];

      try {
        pdf.addImage(photo, 'JPEG', margin, photoY, width, height);
        photoY += height + 5;
      } catch (e) {
        console.error('이미지 추가 실패:', e);
      }
    }
  }

  return pdf.output('blob');
}

export async function shareLoanPDF(loan: Loan): Promise<void> {
  const pdfBlob = await generateLoanPDF(loan);
  const file = new File([pdfBlob], `빌리_${loan.borrowerName}.pdf`, { type: 'application/pdf' });

  if (navigator.share) {
    await navigator.share({
      title: `빌리 - ${loan.borrowerName}님 대출 기록`,
      files: [file],
    });
  } else {
    throw new Error('이 환경에서는 공유 기능을 사용할 수 없습니다.');
  }
}
