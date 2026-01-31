# Multi-Application Type Categories Implementation Plan

## Overview

Implement support for three application types (Common, Grocery, Food) in the category system. Each app type will have its own category hierarchy while sharing a single database.

## Current State Analysis

- **Category Schema**: Has `name`, `image`, `position`, and timestamps
- **No App Type Support**: Categories currently have no app type distinction
- **No Filtering**: Only basic category retrieval exists
- **Constants**: Empty constants file
- **No Default Categories**: Categories start empty and must be created via API

## Implementation Steps

### Step 1: Update Constants

**File**: `src/shared/constants.js`

Add application type enum:

```javascript
const APP_TYPES = {
  COMMON: 'common',
  GROCERY: 'grocery',
  FOOD: 'food',
};

module.exports = { APP_TYPES };
```

### Step 2: Update Category Model

**File**: `src/models/category.model.js`

Add `appType` field to category schema:

```javascript
appType: {
  type: String,
  enum: ['common', 'grocery', 'food'],
  default: 'common',
  required: true
}
```

Add compound index for queries:

```javascript
categorySchema.index({ appType: 1, position: 1 });
```

### Step 3: Update Category Controller

**File**: `src/modules/category/category.controller.js`

Modify `getCategories()`:

- Accept `appType` query parameter
- Filter categories by appType
- Example: `GET /api/categories?appType=grocery`

Modify `addCategory()`:

- Accept `appType` in request body
- Validate against APP_TYPES enum
- Default to 'common' if not provided

Modify `getSubCategories()`:

- Accept `appType` query parameter
- Filter by parent category's appType
- Populate parent category data

Modify `addSubCategory()`:

- Ensure subcategory inherits or explicitly references appType

### Step 4: Update Routes (Optional)

**File**: `src/modules/category/category.routes.js`

Routes remain the same; filtering happens via query parameters:

```
GET    /api/categories?appType=grocery       → getCategories() with filter
GET    /api/categories/sub?appType=food      → getSubCategories() with filter
POST   /api/categories/                      → addCategory() with appType in body
POST   /api/categories/sub                   → addSubCategory() with appType
```

### Step 5: Create Database Seed Function

**File**: `src/core/db/seed.js` (NEW)

Create a seed function that:

- Connects to Category model
- Checks if default categories exist (by name + appType)
- Inserts three default categories if missing:
  - `{ name: 'Common', appType: 'common', position: 0 }`
  - `{ name: 'Grocery', appType: 'grocery', position: 1 }`
  - `{ name: 'Food', appType: 'food', position: 2 }`
- Uses `updateOne()` with `upsert: true` to prevent duplicates
- Returns count of inserted categories

Example structure:

```javascript
async function seedCategories() {
  const defaultCategories = [
    { name: 'Common', appType: 'common', position: 0 },
    { name: 'Grocery', appType: 'grocery', position: 1 },
    { name: 'Food', appType: 'food', position: 2 },
  ];

  let insertedCount = 0;
  for (const category of defaultCategories) {
    const result = await Category.updateOne({ name: category.name, appType: category.appType }, category, { upsert: true });
    if (result.upsertedId) insertedCount++;
  }
  return insertedCount;
}
```

### Step 6: Integrate Seed into Database Connection

**File**: `src/core/db/index.js`

Modify database connection:

- Import the seed function
- Call `seedCategories()` after successful connection
- Log seeding results
- Handle errors gracefully

```javascript
const seedCategories = require('./seed');

// After successful connection:
await seedCategories();
```

## Key Decisions

### 1. SubCategory App Type Strategy

**Decision Needed**:

- **Option A**: Add explicit `appType` field to SubCategory schema (mirrors parent)
- **Option B**: Inherit appType from parent category through reference
- **Recommendation**: Option A for flexibility and direct querying

### 2. Product App Type Strategy

**Decision Needed**:

- **Option A**: Add `appType` field to Product schema (independent filtering)
- **Option B**: Inherit from category relationship only
- **Recommendation**: Option A for multi-app product listings and flexibility

### 3. Backward Compatibility

**Decision**: Existing categories without `appType` will default to 'common' on next save/update

### 4. Default Images

**Decision**: Default categories will have no images initially; images can be uploaded separately via API or added later

## Testing Strategy

1. **Seed Verification**: Check that three default categories exist after app startup
2. **Filtering Test**: Verify `GET /api/categories?appType=grocery` returns only grocery categories
3. **Duplicate Prevention**: Restart app and verify categories aren't duplicated
4. **Create Category Test**: POST new categories with different appTypes
5. **Query Combinations**: Test filtering combinations and edge cases

## Rollout Plan

1. ✅ Create constants file
2. ✅ Update category model with appType field
3. ✅ Implement seed function
4. ✅ Integrate seed into DB connection
5. ✅ Update category controller with filtering
6. ✅ Test seed and filtering
7. ✅ (Optional) Update product model with appType
8. ✅ (Optional) Add SubCategory appType support

## Migration Path

For existing production data:

- Add migration script to populate `appType: 'common'` for all existing categories
- Run migration before deploying seed function
- Verify data integrity after migration
