import { Secret } from "jsonwebtoken"
import config from "../../../config"
import ApiError from "../../../errors/ApiError"
import { jwtHelpers } from "../../../helpers/jwtHelper"
import { IUser, UserRole } from "../user/user.interface"
import { User } from "../user/user.model"
import { Admin } from "./admin.model"

export type adminDataType = {
  phoneNumber: string
  password: string
  role: string
  firstName: string
  lastName: string
  address: string
}

const createAdmin = async (
  adminUserData: adminDataType
): Promise<Partial<IUser> | undefined> => {
  const { phoneNumber, password, role, firstName, lastName, address } =
    adminUserData

  const existingUser = await User.findOne({ phoneNumber }).exec()
  if (existingUser) {
    throw new ApiError(
      400,
      "User with the provided phone number already exists"
    )
  }

  const newAdmin = new Admin({
    name: {
      firstName,
      lastName,
    },
    address,
  })
  const savedAdmin = await newAdmin.save()

  const newUser = new User({
    phoneNumber,
    role: UserRole.ADMIN || role,
    password,
    admin: savedAdmin._id,
  })
  const savedUser = await newUser.save()

  const returnData = {
    _id: savedUser._id,
    role: savedUser.role,
    name: {
      firstName: savedAdmin.name.firstName,
      lastName: savedAdmin.name.lastName,
    },
    phoneNumber: savedUser.phoneNumber,
    address: savedAdmin.address,
  }

  return returnData
}

const adminLogin = async (
  phoneNumber: string,
  password: string
): Promise<{ accessToken: string }> => {
  // console.log(phoneNumber, password)
  const user = await User.findOne({ phoneNumber }).exec()
  // console.log(user)

  if (!user || user.password !== password) {
    throw new ApiError(401, "Invalid phone number or password")
  }

  // Generate the access token
  const accessToken = jwtHelpers.createToken(
    { userId: user._id, role: user.role },
    config.jwt.secret as Secret,
    "12h"
  )

  return { accessToken }
}

export const adminService = {
  createAdmin,
  adminLogin,
}
