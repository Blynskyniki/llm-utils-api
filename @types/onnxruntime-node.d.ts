// types/onnxruntime-node.d.ts

declare module 'onnxruntime-node' {
  export type TensorType =
    | 'float32'
    | 'uint8'
    | 'int8'
    | 'uint16'
    | 'int16'
    | 'int32'
    | 'int64'
    | 'string'
    | 'bool'
    | 'float64'
    | 'uint32'
    | 'uint64';

  export class Tensor<T extends number | bigint | boolean | string> {
    constructor(type: TensorType, data: T[] | TypedArray, dims?: number[]);
    type: TensorType;
    data: T[] | TypedArray;
    dims: number[];
  }

  export interface InferenceSessionOptions {
    executionProviders?: string[];
    graphOptimizationLevel?: 'disabled' | 'basic' | 'extended' | 'all';
  }

  export class InferenceSession {
    static create(
      path: string,
      options?: InferenceSessionOptions
    ): Promise<InferenceSession>;
    run(
      feeds: Record<string, Tensor<any>>,
      fetches?: string[]
    ): Promise<Record<string, Tensor<any>>>;
  }

  type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;
}
