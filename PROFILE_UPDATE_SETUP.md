# Profile Update Setup Guide

## ✅ What Has Been Updated

### 1. User Model (`models/User.js`)
- Added `dateOfBirth` field (Date type, nullable)
- Added `gender` field (String enum: Male, Female, Other, Prefer not to say)
- Added `bio` field (String, max 500 characters, nullable)

### 2. Backend API (`routes/users.js`)
- **Profile Update Endpoint** (`PUT /api/users/profile`): Now handles all new fields
- **Profile Get Endpoint** (`GET /api/users/profile`): Returns all new fields
- **Login Endpoint** (`POST /api/users/login`): Returns all new fields
- **Register Endpoint** (`POST /api/users/register`): Returns all new fields

### 3. Frontend (`client/src/pages/Profile.js`)
- Already configured to handle the new fields
- Form data includes all new fields
- Save functionality sends all data to backend

## 🔄 Next Steps Required

### 1. Run Database Migration Script
```bash
cd scripts
node updateUserModel.js
```

This script will:
- Connect to your MongoDB database
- Add the new fields to all existing users
- Set default values (null) for new fields
- Verify the update was successful

### 2. Restart Your Backend Server
After running the migration script, restart your Node.js server to ensure the new model changes take effect.

### 3. Test the Profile Update
1. Go to your profile page
2. Fill in the new fields (Date of Birth, Gender, Bio)
3. Click "Save Changes"
4. Verify the data is saved by refreshing the page

## 📊 What Will Now Be Saved

✅ **Full Name** - Saved to `user.name`
✅ **Email Address** - Saved to `user.email`
✅ **Phone Number** - Saved to `user.phone`
✅ **Date of Birth** - Saved to `user.dateOfBirth`
✅ **Gender** - Saved to `user.gender`
✅ **Bio** - Saved to `user.bio`
✅ **Street Address** - Saved to `user.address.street`
✅ **City** - Saved to `user.address.city`
✅ **State/Province** - Saved to `user.address.state`
✅ **Zip Code** - Saved to `user.address.zipCode`
✅ **Country** - Saved to `user.address.country`

## 🚨 Important Notes

1. **Existing Users**: All existing users will have `null` values for the new fields until they update their profiles
2. **Data Validation**: The backend validates that gender is one of the allowed enum values
3. **Bio Length**: Bio field is limited to 500 characters
4. **Date Format**: Date of Birth should be sent in ISO date format (YYYY-MM-DD)

## 🔍 Verification

After completing the setup, you can verify everything is working by:
1. Checking the MongoDB database for the new fields
2. Testing profile updates with the new fields
3. Verifying the data persists after page refresh
4. Checking that the profile GET endpoint returns all fields

## 🆘 Troubleshooting

If you encounter issues:
1. Ensure the migration script ran successfully
2. Check that your backend server was restarted
3. Verify the MongoDB connection string is correct
4. Check the browser console for any JavaScript errors
5. Check the backend console for any server errors
