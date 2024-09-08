import { Stream } from 'openpgp';

type Data = Uint8Array | string;

export function readFromStream<T extends Data>(stream: Stream<T>): Uint8Array {
  return (stream as unknown as { data: Uint8Array }).data;
}
