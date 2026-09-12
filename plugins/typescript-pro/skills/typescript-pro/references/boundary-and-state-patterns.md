# Boundary and State Patterns

Read this reference only when implementing or reviewing one of these designs:

- a runtime boundary that converts external data into a domain type;
- a closed asynchronous state machine or reducer; or
- an internal event registry whose event names and payloads are a stable,
  closed contract.

Do not add these abstractions for ordinary object construction, simple request
handlers, or open-ended plugin systems. Prefer the smallest local type that
proves the needed invariant.

## 1. Parse external data before returning a domain value

Use `unknown` at the network boundary. A declared response type cannot validate
the bytes received at runtime.

```ts
type User = {
  readonly id: string;
  readonly email: string;
};

type ParseResult<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly reason: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseUser(value: unknown): ParseResult<User> {
  if (!isRecord(value)) {
    return { ok: false, reason: "Expected an object" };
  }

  const { id, email } = value;
  if (typeof id !== "string" || typeof email !== "string") {
    return { ok: false, reason: "Expected string id and email" };
  }

  return { ok: true, value: { id, email } };
}

async function getUser(url: string): Promise<ParseResult<User>> {
  const response = await fetch(url);
  if (!response.ok) {
    return { ok: false, reason: `Request failed with ${response.status}` };
  }

  const body: unknown = await response.json();
  return parseUser(body);
}
```

The proof happens in `parseUser`, not at the `fetch` call or in a type
annotation. Extend the parser for every domain invariant that the caller relies
on; use a schema library only when it materially reduces repeated validation.

## 2. Keep asynchronous states closed and exhaustive

Use a discriminated union when each state permits a different set of fields.
Handle a newly introduced state deliberately by making the default path
unreachable at compile time.

```ts
type AsyncState<T, E> =
  | { readonly status: "idle" }
  | { readonly status: "loading"; readonly requestId: string }
  | { readonly status: "success"; readonly value: T }
  | { readonly status: "error"; readonly error: E };

type AsyncEvent<T, E> =
  | { readonly type: "start"; readonly requestId: string }
  | { readonly type: "succeed"; readonly value: T }
  | { readonly type: "fail"; readonly error: E }
  | { readonly type: "reset" };

function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}

function reduceAsyncState<T, E>(
  state: AsyncState<T, E>,
  event: AsyncEvent<T, E>,
): AsyncState<T, E> {
  switch (state.status) {
    case "idle":
      return event.type === "start" ? { status: "loading", requestId: event.requestId } : state;
    case "loading":
      if (event.type === "succeed") {
        return { status: "success", value: event.value };
      }
      if (event.type === "fail") {
        return { status: "error", error: event.error };
      }
      return event.type === "reset" ? { status: "idle" } : state;
    case "success":
    case "error":
      return event.type === "reset" ? { status: "idle" } : state;
    default:
      return assertNever(state);
  }
}
```

This models known state shapes, not authorization or request ordering. If stale
responses matter, validate the request identifier at runtime before accepting a
completion event.

## 3. Use typed events only for a closed internal contract

An event registry is useful when one module owns both the event vocabulary and
the emitters. Do not use it to claim that events from a browser, webhook, or
third-party plugin have been validated.

```ts
type UserEvents = {
  readonly created: { readonly id: string; readonly email: string };
  readonly deleted: { readonly id: string };
};

type EventListener<Payload> = (payload: Payload) => void;

class TypedEventEmitter<Events extends object> {
  private readonly listeners: {
    [EventName in keyof Events]?: Set<EventListener<Events[EventName]>>;
  } = {};

  on<EventName extends keyof Events>(
    event: EventName,
    listener: EventListener<Events[EventName]>,
  ): () => void {
    const listeners = this.listeners[event] ?? new Set<EventListener<Events[EventName]>>();
    this.listeners[event] = listeners;
    listeners.add(listener);

    return () => listeners.delete(listener);
  }

  emit<EventName extends keyof Events>(event: EventName, payload: Events[EventName]): void {
    for (const listener of this.listeners[event] ?? []) {
      listener(payload);
    }
  }
}

const users = new TypedEventEmitter<UserEvents>();
users.on("created", ({ id, email }) => {
  console.info(`Created ${id}: ${email}`);
});
users.emit("created", { id: "user_1", email: "ada@example.test" });
```

The event type protects internal callers from mixing names and payloads. It does
not establish delivery guarantees, ordering, persistence, error isolation, or
runtime validation. Add those properties only when the system requires them.
