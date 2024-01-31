export type Ok<T> = { ok: true; value: T };
export type Err<E = string> = { ok: false; error: E };

export type Result<T, E = string> = Ok<T> | Err<E>;
