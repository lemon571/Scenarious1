import { test, expect } from '@playwright/test';
// BASE_URL
const BASE_URL = 'http://api.example.com/v1';

let scenarioId: string;
let blockId: string;

test.describe('API тесты для Blocks API', () => {});

// Blocks
// Create block
test('POST /blocks', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/blocks`, {
    data: {
      title: 'Test Block',
      location: 'Test Location',
      start: Date.now(),
      duration: 60,
      roles: ['technician'],
      description: 'Test description',
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveProperty('id');
  // Save block id
  blockId = body.id;
});

// Get block by ID
test('GET /blocks/{block_id}', async ({ request }) => {
  const response = await request.get(`${BASE_URL}/blocks/${blockId}`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toMatchObject({
    id: blockId,
    title: 'Test Block',
    location: 'Test Location',
  });
});

// Update block
test('PATCH /blocks/{block_id} ', async ({ request }) => {
  const response = await request.patch(`${BASE_URL}/blocks/${blockId}`, {
    data: {
      title: 'Updated Block',
      duration: 120,
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.title).toBe('Updated Block');
});

// Comments
// Add comment to block
test('POST /comment/{scenario_id}/{block_id}', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/comment/${scenarioId}/${blockId}`, {
    data: {
      content: 'Test comment',
      creator_id: 'user123',
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.success).toBe(true);
});

// Delete block
test('DELETE /blocks/{block_id}', async ({ request }) => {
  const response = await request.delete(`${BASE_URL}/blocks/${blockId}`);
  expect(response.status()).toBe(200);
});

// Scenario
// Create scenario
test('POST /scenario', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/scenario`, {
    data: {
      name: 'Test Scenario',
      status: 'draft',
      director_id: 'user123',
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();

  // Save scenario id
  scenarioId = body.id;
});

// Get scenario by ID
test('GET /scenario/{scenario_id}', async ({ request }) => {
  const response = await request.get(`${BASE_URL}/scenario/${scenarioId}`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.name).toBe('Test Scenario');
});

// Delete scenario
test('DELETE /scenario/{scenario_id}', async ({ request }) => {
  const response = await request.delete(`${BASE_URL}/scenario/${scenarioId}`);
  expect(response.status()).toBe(200);
});

// Errors
// 404 - Block not found
test('GET /blocks/{block_id} - 404 error', async ({ request }) => {
  const response = await request.get(`${BASE_URL}/blocks/invalid_id`);
  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body.error).toBe('Block not found');
});

// 401 - Authorization error
test('POST /blocks - 401 error', async ({ request }) => {
  const response = await request.post(`${BASE_URL}/blocks`, {
    data: {},
    headers: { Authorization: 'invalid_token' },
  });
  expect(response.status()).toBe(401);
});
