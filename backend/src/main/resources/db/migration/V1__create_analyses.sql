CREATE TABLE analyses (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL,
    language VARCHAR(32) NOT NULL,
    stack_trace TEXT NOT NULL,
    code TEXT NOT NULL,
    result_json JSONB NOT NULL
);
