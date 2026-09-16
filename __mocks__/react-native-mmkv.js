// Manual Jest mock for react-native-mmkv.
//
// v4 is Nitro-based and resolves its native TurboModule as a side effect of
// importing the package, before any test-environment guard runs — so it
// crashes under Jest even though createMMKV() itself has an isTest() check.
// This in-memory mock stands in for it during tests.

function createMMKV() {
  const store = new Map();

  return {
    set: (key, value) => {
      store.set(key, value);
    },
    getString: key => {
      const value = store.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    getNumber: key => {
      const value = store.get(key);
      return typeof value === 'number' ? value : undefined;
    },
    getBoolean: key => {
      const value = store.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    contains: key => store.has(key),
    delete: key => {
      store.delete(key);
    },
    getAllKeys: () => Array.from(store.keys()),
    clearAll: () => {
      store.clear();
    },
  };
}

module.exports = { createMMKV };
