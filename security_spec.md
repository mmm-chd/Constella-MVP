# Security Specification for Constella

## Data Invariants
1. A planet must always belong to the user who created it (`userId == request.auth.uid`).
2. A journal entry must reference a planet that the user owns.
3. Users can only read their own profiles, planets, and journals.
4. `totalInputs` and `stage` on a planet can only be incremented, never decremented (except when a new planet starts).
5. Personality profiles are updated by the system (AI) based on journaling patterns, but stored on the user document.

## The "Dirty Dozen" Payloads (Denial Expected)

1. **Identity Spoofing**: Create a journal entry with someone else's `userId`.
2. **Resource Poisoning**: Use a 2MB string for the journal text.
3. **State Shortcutting**: Create a planet directly at `stage: 5`.
4. **Orphaned Writes**: Create a journal entry for a `planetId` that doesn't exist.
5. **Unauthorized Access**: User A tries to read User B's planet.
6. **Privilege Escalation**: User tries to update their own `uid` or `email` on the user doc.
7. **Ghost Update**: Update a planet but inject an `isAdmin: true` field.
8. **Malicious ID**: Use `../junk/path` as a document ID.
9. **Terminal State Bypass**: Attempt to update a planet that is already `archived`.
10. **Timestamp Fraud**: Provide a manual `createdAt` timestamp from the client.
11. **PII Leak**: Authenticated user tries to list all user emails.
12. **Relationship Deletion**: User tries to delete a planet that has journals linked to it (well, we might just allow delete if they own it, but journals would be orphaned. Better to restrict delete or enforce cascading logic if possible, but Firestore rules are limit for cascading. Let's just say users can't delete archived planets to preserve history).

## Test Runner (Conceptual)
The following tests verify that the above payloads return PERMISSION_DENIED.
(Implementation would be in `firestore.rules.test.ts`)
