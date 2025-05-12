# Supabase Users Table Integration

This document explains how to set up proper user table integration with Supabase Auth.

## Overview

The provided SQL scripts will:

1. Create a `public.users` table (if the `profiles` table doesn't already exist)
2. Set up a trigger to automatically add new users from `auth.users` to your public table
3. Backfill existing users from `auth.users` to your public table
4. Handle both cases: using a new `users` table or an existing `profiles` table

## Using the Migration Script

If you're using Supabase migrations, you can use the provided migration file:

```bash
supabase/migrations/20240710000000_create_users_table.sql
```

This will be automatically applied when you run:

```bash
supabase db reset
```

## Using the SQL Editor

If you prefer to run the script directly in the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy the contents of `scripts/create_users_table.sql`
5. Run the query

## Understanding the Logic

The script handles two scenarios:

### Scenario 1: Using the `profiles` table

If a `profiles` table already exists (which is common in Supabase templates):

- No new table will be created
- The trigger will insert new auth users into the `profiles` table
- The backfill will add existing auth users to the `profiles` table

### Scenario 2: Creating a new `users` table

If no `profiles` table exists:

- A new `users` table will be created with:
  - `id` column (UUID type, matching `auth.users.id`)
  - `email` column
  - `name` column
  - `created_at` and `updated_at` timestamps
- RLS policies will be set up for proper security
- The trigger will insert new auth users into the `users` table
- The backfill will add existing auth users to the `users` table

## How It Works

1. A trigger function `handle_new_user()` is created to detect new user signups
2. A trigger `on_auth_user_created` is attached to `auth.users` table
3. When a new user signs up, the trigger automatically adds them to your public table
4. A backfill operation adds all existing users

## Verification

To verify the setup:

```sql
-- Check if users table exists (if profiles doesn't exist)
SELECT * FROM public.users;

-- Check if profiles table exists and has users
SELECT * FROM public.profiles;

-- Check if the trigger is set up
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement
FROM 
  information_schema.triggers
WHERE 
  event_object_table = 'users' 
  AND trigger_schema = 'auth';
```

## Customization

If you need to add more columns to the users table or modify the structure:

1. Edit the table creation part of the script
2. Add the new columns to the INSERT statement in the trigger function 