// Vercel Blob kimlik bilgisi çözümü.
//
// Store projeye bağlanınca Vercel yalnız BLOB_STORE_ID (+ runtime'da
// VERCEL_OIDC_TOKEN) enjekte eder, BLOB_READ_WRITE_TOKEN gelmez. Üçünden biri
// varsa Blob kullanılır; hiçbiri yoksa lokal dosya fallback'i devreye girer.
//
// Not: "useBlob" yerine isBlobEnabled — "use" önekli fonksiyonlar ESLint
// rules-of-hooks tarafından React hook sayılıyor.
export function isBlobEnabled(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      process.env.VERCEL_OIDC_TOKEN,
  );
}

// SDK `if (options?.token)` ile kontrol ediyor; token: undefined bile
// geçilmemeli. Her çağrıda `{ ...blobAuth() }` olarak spread edilir.
export function blobAuth(): { token?: string } {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return token ? { token } : {};
}
