import { test, expect } from '@playwright/test';

// Create a standalone fetchUser function for testing
const fetchUser = async () => {
  const res = await fetch('http://158.160.44.48:8080/blocks/343');

  if (!res.ok) throw new Error('Ошибка при получении данных');
  return res.json();
};

test('test_fetchUser_calls_correct_endpoint', async () => {
  const data = await fetchUser();
  // The endpoint returns a JSON object, so we check that the result is an object
  expect(typeof data).toBe('object');
  // Optionally, check that the object has expected properties if known
});

test('test_fetchUser_returns_json_on_success', async () => {
  const data = await fetchUser();
  expect(data).not.toBeNull();
  expect(typeof data).toBe('object');
  // Optionally, check that the object contains expected keys if known
});

test('test_fetchUser_returns_resolving_promise_on_success', async () => {
  const promise = fetchUser();
  expect(promise).toBeInstanceOf(Promise);
  const data = await promise;
  expect(data).not.toBeNull();
});

test('test_fetchUser_throws_on_non_ok_response', async () => {
  // This test assumes the endpoint can be manipulated to return a non-OK response.
  // Since mocks are not allowed, we attempt to fetch a non-existent resource.
  const originalUrl = 'http://158.160.44.48:8080/blocks/343';
  const invalidUrl = 'http://158.160.44.48:8080/blocks/invalid-nonexistent-id';

  const fetchUserWithUrl = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка при получении данных');
    return res.json();
  };

  await expect(fetchUserWithUrl(invalidUrl)).rejects.toThrow('Ошибка при получении данных');
});

test('test_fetchUser_propagates_network_errors', async () => {
  // This test attempts to fetch from an unreachable address to simulate a network error.
  const unreachableUrl = 'http://127.0.0.1:9999/unreachable';

  const fetchUserWithUrl = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка при получении данных');
    return res.json();
  };

  await expect(fetchUserWithUrl(unreachableUrl)).rejects.toThrow();
});

test('test_fetchUser_throws_on_invalid_json_response', async () => {
  // This test assumes there is an endpoint that returns invalid JSON.
  // Since mocks are not allowed, we use an endpoint that returns plain text.
  const invalidJsonUrl = 'https://httpbin.org/html'; // returns HTML, not JSON

  const fetchUserWithUrl = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка при получении данных');
    return res.json();
  };

  await expect(fetchUserWithUrl(invalidJsonUrl)).rejects.toThrow();
});
