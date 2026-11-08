# Security policy

## Scope
This repository is a static, browser-only checker. It has no server, no accounts and no data upload. The most relevant risks are client-side injection, unsafe rendering of user input, and accidental inclusion of secrets or trackers.

## Reporting
Please do not open a public issue for a security problem. Use GitHub's **private vulnerability reporting** (Security → Report a vulnerability) on this repository. Include:
- affected page/file and browser,
- minimal reproduction input,
- what you expected vs what happened.

We will acknowledge and investigate. No bounty program is offered.

## Design boundaries
- No network calls from the checker (`connect-src 'none'`).
- No storage, cookies or analytics.
- All user-entered content is escaped before rendering; JSON export is local.
- `REVIEW` is structural comparability only; `sourceVerified` is always `false`.
