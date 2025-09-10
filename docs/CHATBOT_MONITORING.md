# Chatbot Monitoring Runbook

This document describes how to monitor the `chatbot` Edge Function.

## Logging

The function sends structured logs to the URL defined by the `LOG_SERVICE_URL` environment variable. Logs are also written to the console for local debugging.

Each log entry contains:

- `level` – `info` or `error`
- `message` – description of the event
- `metadata` – contextual fields (conversation id, user id, etc.)
- `timestamp` – ISO date string

To investigate issues, query the external logging service for log entries with `message` such as `chatbot function error` or `conversation escalated`.

## Metrics

Metrics are emitted to the endpoint specified by `METRICS_SERVICE_URL`.

### Available metrics

| Metric name | Description |
|-------------|-------------|
| `chatbot_response_time_ms` | Total function processing time in milliseconds. |
| `chatbot_escalations` | Count of conversations that were escalated to human support. |

## Investigating slow responses

1. Query `chatbot_response_time_ms` to identify periods with elevated latency.
2. Correlate with log entries to locate slow external calls (e.g. OpenAI, database).
3. Review recent deploys or infrastructure changes if latency persists.

## Investigating escalations

1. Check `chatbot_escalations` metric for spikes.
2. Use the logging service to find `conversation escalated` events and review user questions.
3. Reach out to support if escalations indicate gaps in knowledge base.

