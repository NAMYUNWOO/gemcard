declare module 'unishox2.siara.cc' {
  export function unishox2_compress_simple(
    input: string,
    len: number,
    out: Uint8Array
  ): number;

  export function unishox2_decompress_simple(
    input: Uint8Array,
    len: number
  ): string;
}
