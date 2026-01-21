# Credit System

The credit system manages user balances and tracks all financial transactions for API usage billing.

## Overview

Credits are the internal currency used to pay for API requests. Users must have sufficient credits to make API calls, and credits are deducted based on token usage and model pricing.

## Data Model

### User Credits
```typescript
interface UserCredits {
  id: string;
  userId: string;
  balance: number;         // Current available balance
  totalPurchased: number;  // Lifetime credits added
  totalConsumed: number;   // Lifetime credits used
  updatedAt: Date;
}
```

### Credit Transaction
```typescript
interface CreditTransaction {
  id: string;
  userId: string;
  type: 'grant' | 'deduction' | 'refund';
  amount: number;          // Positive for grant/refund, negative for deduction
  balanceAfter: number;    // Balance after transaction
  description: string;
  metadata?: object;       // Additional context (API key, model, tokens)
  createdAt: Date;
}
```

## Transaction Types

### Grant
Credits added to user account by admin.
```typescript
{
  type: 'grant',
  amount: 100.00,
  description: 'Initial credit grant'
}
```

### Deduction
Credits consumed by API usage.
```typescript
{
  type: 'deduction',
  amount: -0.0234,
  description: 'API usage: 150 input + 200 output tokens',
  metadata: {
    apiKeyId: 'uuid',
    modelId: 'uuid',
    tokensInput: 150,
    tokensOutput: 200
  }
}
```

### Refund
Credits returned to user (e.g., for failed requests or disputes).
```typescript
{
  type: 'refund',
  amount: 0.50,
  description: 'Refund for service disruption'
}
```

## Credit Operations

### Check Balance
```typescript
const balance = await creditService.getBalance(userId);
// Returns: { balance: 45.50, totalPurchased: 100, totalConsumed: 54.50 }
```

### Deduct Credits
Called automatically after successful API requests.
```typescript
await creditService.deductCredits(userId, cost, {
  apiKeyId: 'key-uuid',
  modelId: 'model-uuid',
  tokensInput: 150,
  tokensOutput: 200
});
```

### Add Credits (Admin)
```typescript
await creditService.addCredits(userId, amount, 'Credit purchase');
```

### Check Sufficient Credits
```typescript
const hasCredits = await creditService.checkSufficientCredits(userId, estimatedCost);
// Returns: true/false
```

## Credit Deduction on API Usage

### Flow
1. User makes API request
2. System checks minimum credit balance (0.001)
3. Request processed by provider
4. Token usage extracted from response
5. Cost calculated: `(input_tokens/1000 * input_price) + (output_tokens/1000 * output_price)`
6. Credits deducted in atomic transaction
7. Transaction logged with metadata

### Atomic Transaction
Credit deductions use database transactions to ensure consistency:
```typescript
await prisma.$transaction(async (tx) => {
  // Get current balance with lock
  const credits = await tx.userCredits.findUnique({ where: { userId } });
  
  // Verify sufficient balance
  if (credits.balance < amount) {
    throw new Error('Insufficient credits');
  }
  
  // Update balance
  await tx.userCredits.update({
    where: { userId },
    data: {
      balance: { decrement: amount },
      totalConsumed: { increment: amount }
    }
  });
  
  // Create transaction record
  await tx.creditTransaction.create({ ... });
});
```

## Admin Credit Granting

### Endpoint
```
POST /api/admin/users/:id/credits
```

### Request
```json
{
  "amount": 50.00,
  "description": "Monthly credit allocation"
}
```

### Response
```json
{
  "message": "Credits granted successfully",
  "transaction": {
    "id": "uuid",
    "type": "grant",
    "amount": 50.00,
    "balance_after": 95.50
  }
}
```

## API Endpoints

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me/credits` | Get balance and recent transactions |
| GET | `/api/users/me/credits/transactions` | List all transactions (paginated) |

### Admin Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/users/:id/credits` | Grant credits to user |

## Response Examples

### Get Credits
```json
{
  "balance": 45.50,
  "total_purchased": 100.00,
  "total_consumed": 54.50,
  "recent_transactions": [
    {
      "id": "uuid",
      "type": "deduction",
      "amount": -0.0234,
      "balance_after": 45.50,
      "description": "API usage: 150 input + 200 output tokens",
      "created_at": "2026-01-21T10:30:00Z"
    }
  ]
}
```

## Precision

- Balance stored as `DECIMAL(12, 4)` - supports up to 99,999,999.9999
- Transaction amounts stored as `DECIMAL(12, 4)`
- Cost calculations use full precision before rounding

