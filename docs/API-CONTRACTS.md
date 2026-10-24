# API contract playground

`public/openapi/portfolio-api.json` is an OpenAPI 3.1 example contract. It includes pagination, filtering/sorting parameters, request and response schemas, standard errors, rate-limit headers, and a deprecated operation. The `example.invalid` server is intentionally non-routable. The UI's local mock behavior does not send network requests and does not provide a production API.

Run `npm run validate:openapi`. This repository's dependency-free validator checks JSON parsing and core structure; it is not a complete OpenAPI specification conformance validator. Download the JSON file from the API playground page. YAML export and automated semantic breaking-change detection remain planned.
