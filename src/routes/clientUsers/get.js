import clientUserModel from "../../models/clientUser";

export const listClientUser = async (req, res) => {
  const users = await clientUserModel.find();

  res.status(200).json({ message: "users fetched successfully", users });
};
