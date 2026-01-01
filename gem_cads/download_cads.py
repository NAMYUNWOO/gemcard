#!/usr/bin/env python3
"""
CAD 파일 다운로드 스크립트
cadurls.md 파일에서 URL을 읽어 파일들을 다운로드합니다.
"""

import os
import requests
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse
import time
import argparse


def get_filename_from_url(url: str) -> str:
    """URL에서 파일명 추출"""
    parsed = urlparse(url)
    return os.path.basename(parsed.path)


def download_file(url: str, output_dir: Path, timeout: int = 30) -> tuple[str, bool, str]:
    """
    단일 파일 다운로드

    Returns:
        tuple: (파일명, 성공여부, 메시지)
    """
    filename = get_filename_from_url(url)
    filepath = output_dir / filename

    # 이미 존재하는 파일 스킵
    if filepath.exists():
        return (filename, True, "이미 존재함")

    try:
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()

        with open(filepath, 'wb') as f:
            f.write(response.content)

        return (filename, True, "다운로드 완료")

    except requests.exceptions.Timeout:
        return (filename, False, "타임아웃")
    except requests.exceptions.HTTPError as e:
        return (filename, False, f"HTTP 에러: {e.response.status_code}")
    except requests.exceptions.RequestException as e:
        return (filename, False, f"요청 에러: {str(e)}")
    except Exception as e:
        return (filename, False, f"에러: {str(e)}")


def load_urls(filepath: str) -> list[str]:
    """URL 파일 로드"""
    with open(filepath, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]
    return urls


def download_all(
    url_file: str,
    output_dir: str = "downloads",
    max_workers: int = 10,
    timeout: int = 30
):
    """
    모든 파일 다운로드

    Args:
        url_file: URL이 저장된 파일 경로
        output_dir: 다운로드 파일 저장 디렉토리
        max_workers: 동시 다운로드 수
        timeout: 요청 타임아웃 (초)
    """
    # URL 로드
    urls = load_urls(url_file)
    total = len(urls)
    print(f"총 {total}개의 URL을 로드했습니다.")

    # 출력 디렉토리 생성
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    print(f"다운로드 디렉토리: {output_path.absolute()}")

    # 통계
    success_count = 0
    skip_count = 0
    fail_count = 0
    failed_urls = []

    start_time = time.time()

    # 병렬 다운로드
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {
            executor.submit(download_file, url, output_path, timeout): url
            for url in urls
        }

        for i, future in enumerate(as_completed(futures), 1):
            url = futures[future]
            filename, success, message = future.result()

            if success:
                if "이미 존재" in message:
                    skip_count += 1
                else:
                    success_count += 1
            else:
                fail_count += 1
                failed_urls.append((url, message))

            # 진행 상황 출력
            progress = (i / total) * 100
            print(f"\r[{progress:5.1f}%] {i}/{total} - {filename}: {message}", end="", flush=True)

    # 결과 출력
    elapsed = time.time() - start_time
    print(f"\n\n{'='*50}")
    print(f"다운로드 완료!")
    print(f"{'='*50}")
    print(f"총 소요 시간: {elapsed:.1f}초")
    print(f"성공: {success_count}개")
    print(f"스킵 (이미 존재): {skip_count}개")
    print(f"실패: {fail_count}개")

    # 실패한 URL 저장
    if failed_urls:
        failed_file = output_path / "failed_urls.txt"
        with open(failed_file, 'w') as f:
            for url, msg in failed_urls:
                f.write(f"{url}\t{msg}\n")
        print(f"\n실패한 URL 목록: {failed_file}")


def main():
    parser = argparse.ArgumentParser(description="CAD 파일 다운로드 스크립트")
    parser.add_argument(
        "-i", "--input",
        default="cadurls.md",
        help="URL 파일 경로 (기본: cadurls.md)"
    )
    parser.add_argument(
        "-o", "--output",
        default="downloads",
        help="다운로드 디렉토리 (기본: downloads)"
    )
    parser.add_argument(
        "-w", "--workers",
        type=int,
        default=10,
        help="동시 다운로드 수 (기본: 10)"
    )
    parser.add_argument(
        "-t", "--timeout",
        type=int,
        default=30,
        help="요청 타임아웃 초 (기본: 30)"
    )

    args = parser.parse_args()

    download_all(
        url_file=args.input,
        output_dir=args.output,
        max_workers=args.workers,
        timeout=args.timeout
    )


if __name__ == "__main__":
    main()
