# Password Authentication System Guide

## Overview

The Imtehaan AI EdTech Platform now includes a comprehensive password-based authentication system that stores passwords securely in the users table and verifies them during signin.

## How It Works

### 1. Password Storage
- Passwords are hashed using SHA-256 before storage
- Hashed passwords are stored in the `password_hash` field of the users table
- Original passwords are never stored in plain text

### 2. Signup Process
1. User enters email, password, and other details
2. System checks if email already exists
3. Password is hashed using SHA-256
4. User is created in Supabase auth.users (triggers user creation in users table)
5. Password hash is stored in the users table
6. User is redirected to login page

### 3. Signin Process
1. User enters email and password
2. System retrieves user from users table
3. Entered password is hashed and compared with stored hash
4. If passwords match, user is authenticated via Supabase
5. User data is loaded from users table and session is created

## Database Schema Changes

### Users Table
```sql
ALTER TABLE users ADD COLUMN password_hash TEXT;
```

The `password_hash` field stores the SHA-256 hash of user passwords.

## Security Features

### Password Hashing
- Uses SHA-256 hashing algorithm
- Passwords are hashed client-side before transmission
- Hash comparison is done server-side

### Authentication Flow
- Primary authentication through custom password verification
- Supabase auth is used for session management
- Fallback to local authentication if Supabase is unavailable

## Implementation Files

### 1. `utils/supabase/auth-service.ts`
- Core authentication logic
- Password hashing and verification
- User creation and authentication

### 2. `utils/supabase/AuthContext.tsx`
- React context for authentication state
- Integration with AuthService
- Fallback authentication methods

### 3. `components/SignUpPage.tsx`
- Updated signup form
- Integration with new authentication system

### 4. `components/LoginPage.tsx`
- Updated login form
- Password verification flow

## Usage

### For New Users
1. Navigate to signup page
2. Enter email, password, and other details
3. System creates account with hashed password
4. Sign in with email and password

### For Existing Users
- Existing users will need to reset their passwords
- The system provides placeholder hashes for existing accounts
- Consider implementing a password reset flow

## Database Setup

Run the following SQL script to update your existing database:

```sql
-- Add password_hash field to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN users.password_hash IS 'SHA-256 hash of user password for local authentication';

-- Update existing users to have a default password hash
UPDATE users 
SET password_hash = 'placeholder_hash_for_existing_users' 
WHERE password_hash IS NULL;
```

## Testing

### Test Signup
1. Create a new account with email and password
2. Check that password_hash is stored in users table
3. Verify the hash is not the plain text password

### Test Signin
1. Sign in with the created account
2. Verify authentication works with stored password hash
3. Test with incorrect password (should fail)

## Security Considerations

### Current Implementation
- Uses SHA-256 for password hashing
- Suitable for development and testing

### Production Recommendations
- Use bcrypt or Argon2 for password hashing
- Implement password strength requirements
- Add rate limiting for login attempts
- Implement account lockout after failed attempts
- Use HTTPS for all authentication requests

## Troubleshooting

### Common Issues

1. **Password verification fails**
   - Check if password_hash field exists in users table
   - Verify the hashing algorithm matches between signup and signin

2. **User creation fails**
   - Check Supabase configuration
   - Verify database permissions
   - Check trigger function for user creation

3. **Authentication errors**
   - Check browser console for error messages
   - Verify database connection
   - Check RLS policies

### Debug Mode
Enable console logging in the browser to see detailed authentication flow:
- Signup attempts
- Password hashing
- Database operations
- Authentication results

## Future Enhancements

1. **Password Reset Flow**
   - Email-based password reset
   - Secure token generation
   - Password change verification

2. **Enhanced Security**
   - Multi-factor authentication
   - Session management
   - Account lockout policies

3. **User Management**
   - Admin user management
   - Bulk user operations
   - User activity logging

## Support

For technical support or questions about the authentication system:
1. Check the browser console for error messages
2. Verify database schema and permissions
3. Test with a fresh database setup
4. Review the authentication flow logs
