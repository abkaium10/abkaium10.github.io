# Security posture and reporting

This is a public static portfolio. Browser code and all `NEXT_PUBLIC_*` variables are public. Never place passwords, private tokens, service-role keys, or credentials in frontend variables. The admin UI is a local editor, not authenticated server administration; browser-only checks cannot protect a public backend.

Run `npm run audit:security` for a heuristic scan of selected public assets and workflow configuration. It does not replace `npm audit`, a dedicated secret scanner, code review, or penetration testing. CI dependency auditing is separate and may be blocked if the registry is unavailable. The scan avoids printing suspected secret contents. The threat model covers accidental public secret commits, unsafe CI permissions, untrusted pull request execution, client-side trust assumptions, and external-link supply-chain risks.

Disclosure: report suspected vulnerabilities privately to the repository maintainer using the contact published in the repository profile. Do not include credentials or personal data in public issues. No security certification or guarantee is claimed.
