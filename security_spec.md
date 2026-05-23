# Firebase Security Specification

## Data Invariants
1. **User Integrity**: A user can only read and write their own profile document (`/users/{uid}`). Role fields are immutable for the user themselves.
2. **Agency Ownership**: Only the `ownerId` of an agency or a `SUPER_ADMIN` can update an agency's configuration (theme, domain, logo).
3. **Product Control**: An agency can only manage products where `agencyId` matches their own agency ID.
4. **Transaction Security**: Buyers can only create transactions for themselves. Once a transaction status is 'SUCCESS', it cannot be modified.
5. **Role-Based Access**: `PLATFORM_ADMIN` and `SUPER_ADMIN` have broad read access across the platform for monitoring.

## The "Dirty Dozen" (Attack Payloads)
1. **Identity Spoofing**: User A attempts to write to `/users/userB`.
2. **Privilege Escalation**: User A attempts to update their own role from `BUYER` to `SUPER_ADMIN`.
3. **Agency Hijacking**: Agency A attempts to update Agency B's `logoUrl`.
4. **Product Price Injection**: Buyer A attempts to update a product's `price` before purchase.
5. **Orphaned Product**: User attempts to create a product with a non-existent `agencyId`.
6. **Unauthorized Global Settings Write**: Agency A attempts to update `/settings/global`.
7. **Transaction Status Forgery**: Buyer A attempts to update their own transaction status to `SUCCESS`.
8. **Shadow Field Injection**: User attempts to add `isVerified: true` to an agency document.
9. **DNS Poisoning**: Agency A attempts to set their domain to a 1MB string.
10. **Membership Bypass**: Reseller A attempts to list products from Agency B without a relationship.
11. **PII Leak**: Buyer A attempts to `get` the email of every other user.
12. **Terminal State Reversal**: Admin attempts to change a `SUCCESS` transaction back to `PENDING`. (Allowed by Admin escape hatch? No, transactions should be immutable for everyone to maintain ledger integrity).

## Test Cases
- [ ] User can READ their own profile.
- [ ] User CANNOT write to another user's profile.
- [ ] Agency Owner can UPDATE their agency branding.
- [ ] Non-Owner CANNOT update agency branding.
- [ ] Super Admin can READ all agencies.
- [ ] Buyer can CREATE a transaction with status PENDING.
- [ ] Buyer CANNOT update transaction status to SUCCESS.
- [ ] Agency can CREATE products for their own agency.
