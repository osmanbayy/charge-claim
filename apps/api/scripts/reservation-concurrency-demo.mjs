const requestCount = 20;

const apiUrl = process.env.CONCURRENCY_API_URL ?? 'http://localhost:3001/api';

const accessToken = process.env.CONCURRENCY_ACCESS_TOKEN;

const connectorId = Number(process.env.CONCURRENCY_CONNECTOR_ID);

const startAt = process.env.CONCURRENCY_START_AT;

const durationMinutes = Number(process.env.CONCURRENCY_DURATION_MINUTES ?? '60');

if (!accessToken)
  throw new Error(
    'CONCURRENCY_ACCESS_TOKEN is required.',
  );

if (!Number.isInteger(connectorId) || connectorId < 1)
  throw new Error(
    'CONCURRENCY_CONNECTOR_ID must be a positive integer.',
  );


if (!startAt)
  throw new Error(
    'CONCURRENCY_START_AT is required.',
  );


if (![30, 60, 90, 120].includes(durationMinutes))
  throw new Error(
    'CONCURRENCY_DURATION_MINUTES must be 30, 60, 90 or 120.',
  );


const requestBody = {
  connectorId,
  startAt,
  durationMinutes,
};

async function sendReservationRequest(
  requestNumber,
) {
  const response = await fetch(
    `${apiUrl}/reservations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    },
  );

  let responseBody = null;

  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  return {
    requestNumber,
    status: response.status,
    responseBody,
  };
}

console.log('Reservation concurrency demo');
console.log('----------------------------');
console.log(`Connector ID: ${connectorId}`);
console.log(`Start time: ${startAt}`);
console.log(`Duration: ${durationMinutes} minutes`);
console.log(`Parallel request count: ${requestCount}`);
console.log('');

const startedAt = performance.now();

const results = await Promise.all(
  Array.from(
    { length: requestCount },
    (_, index) =>
      sendReservationRequest(index + 1),
  ),
);

const elapsedMilliseconds = performance.now() - startedAt;

const successResults = results.filter((result) => result.status === 201);

const conflictResults = results.filter((result) => result.status === 409);

const unexpectedResults = results.filter(
  (result) =>
    result.status !== 201 &&
    result.status !== 409,
);

for (const result of results) {
  const errorCode =
    result.responseBody &&
    typeof result.responseBody === 'object' &&
    'code' in result.responseBody
      ? result.responseBody.code
      : null;

  console.log(
    [
      `Request ${String(
        result.requestNumber,
      ).padStart(2, '0')}`,
      `HTTP ${result.status}`,
      errorCode ? `Code: ${errorCode}` : null,
    ]
      .filter(Boolean)
      .join(' | '),
  );
}

console.log('');
console.log('Summary');
console.log('-------');
console.log(`Successful (201): ${successResults.length}`);
console.log(`Conflict (409): ${conflictResults.length}`);
console.log(
  `Unexpected: ${unexpectedResults.length}`,
);
console.log(
  `Elapsed: ${elapsedMilliseconds.toFixed(0)} ms`,
);

const demoPassed =
  successResults.length === 1 &&
  conflictResults.length ===
    requestCount - 1 &&
  unexpectedResults.length === 0;

console.log('');
console.log(
  demoPassed
    ? 'DEMO PASSED: Exactly one reservation was created.'
    : 'DEMO FAILED: Results did not match the expected concurrency guarantee.',
);

if (!demoPassed) {
  process.exitCode = 1;
}

// $env:CONCURRENCY_API_URL='http://localhost:3001/api'
// $env:CONCURRENCY_ACCESS_TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJEUklWRVIiLCJpYXQiOjE3ODY5MTE4NDAsImV4cCI6MTc4Njk0MDY0MH0.4uin1xPFpDU0ArPkUHdPrO8-s5U0N2NU8OyiK70FYQE'
// $env:CONCURRENCY_CONNECTOR_ID='20'
// $env:CONCURRENCY_START_AT='2026-08-18T10:00:00.000Z'
// $env:CONCURRENCY_DURATION_MINUTES='60'