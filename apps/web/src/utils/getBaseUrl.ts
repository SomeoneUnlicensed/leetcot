export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // In the browser, we return a relative URL
    return '';
  }
  // When rendering on the server, we return an absolute URL

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.NODE_ENV === 'production') {
    return 'https://leetcot.ru';
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
