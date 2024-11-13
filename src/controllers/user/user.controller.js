import User from "../../models/user.model.js";
import { ok, error, notFound, badRequest } from "../../handlers/respone.handler.js";

// [GET] /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.user_id; // Get from decoded token
    const user = await User.findById(userId).select('-user_password -refresh_token');

    if (!user) {
      return notFound(res, "User not found");
    }

    return ok(res, { user });
  } catch (err) {
    console.log("Error:", err);
    return error(res, "Internal server error");
  }
};

// [PUT] /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id; // Get from decoded token
    const updateData = req.body;

    // Prevent updating sensitive fields
    const allowedUpdates = [
      'user_name', 
      'user_avt',
      'user_sex',
      'user_birth_day',
      'user_phone_number'
    ];
    
    const updates = {};
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        // Validate phone number format
        if (key === 'user_phone_number') {
          const phoneRegex = /^[0-9]{10,11}$/;
          if (!phoneRegex.test(updateData[key])) {
            return badRequest(res, "Invalid phone number format");
          }
        }
        
        // Validate birth date format
        if (key === 'user_birth_day') {
          const date = new Date(updateData[key]);
          if (isNaN(date.getTime())) {
            return badRequest(res, "Invalid birth date format");
          }
        }

        // Validate sex
        if (key === 'user_sex') {
          const validSexValues = ['Nam', 'Nữ', 'Khác'];
          if (!validSexValues.includes(updateData[key])) {
            return badRequest(res, "Invalid sex value");
          }
        }

        updates[key] = updateData[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return badRequest(res, "No valid fields to update");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true }
    ).select('-user_password -refresh_token');

    if (!updatedUser) {
      return notFound(res, "User not found");
    }

    return ok(res, { 
      message: "Profile updated successfully",
      user: updatedUser 
    });

  } catch (err) {
    console.log("Error:", err);
    return error(res, "Internal server error");
  }
}; 