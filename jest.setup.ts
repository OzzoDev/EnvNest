import { TextEncoder, TextDecoder } from "util";

(
  global as unknown as {
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
  }
).TextEncoder = TextEncoder;
(
  global as unknown as {
    TextEncoder: typeof TextEncoder;
    TextDecoder: typeof TextDecoder;
  }
).TextDecoder = TextDecoder;
