declare module 'stream-buffers' {
  import { Writable } from 'stream';

  class WritableStreamBuffer extends Writable {
    constructor(options?: WritableStreamBufferOptions);
    getContents(): Buffer | null;
    getContentsAsString(encoding?: BufferEncoding): string | null;
    size(): number;
  }

  interface WritableStreamBufferOptions {
    initialSize?: number;
    incrementAmount?: number;
  }

  export { WritableStreamBuffer, WritableStreamBufferOptions };
}
