# Security Specification - WooCommerce Data

## 1. Data Invariants
- Orders must belong to a system context or be accessible by admins.
- Customers must be accessible by admins for management.
- All writes must respect the schema defined in `firebase-blueprint.json`.
- Status updates for orders must follow valid transitions.

## 2. The Dirty Dozen Payloads (Target: Permission Denied)
1. **Identity Spoofing**: User A trying to read Order B.
2. **Resource Poisoning**: Creating an order with a document ID that is a 2MB string.
3. **Ghost Field Update**: Updating an order to include `isTest: true`.
4. **Auth Bypass**: Reading customers while unauthenticated.
5. **State Shortcut**: Changing order status from `pending` to `completed` directly (if logic requires `processing` first).
6. **Immutable Field Write**: Changing the `order_number` after creation.
7. **PII Leak**: A non-admin searching the `customers` collection.
8. **Resource Exhaustion**: Inserting a massive array into items.
9. **Fake Verification**: Claiming an order belongs to an email without proof.
10. **Shadow Admin**: Using a manipulated token to gain `isAdmin` privileges.
11. **Negative Total**: Creating an order with `total: -500`.
12. **Future Date**: Setting `created_at` in the future.

## 3. Test Runner (Draft)
```typescript
// firestore.rules.test.ts (Logic outline)
test('non-admin cannot list orders', async () => { ... });
test('admin can list orders', async () => { ... });
test('non-admin cannot list customers', async () => { ... });
test('admin can list customers', async () => { ... });
```
