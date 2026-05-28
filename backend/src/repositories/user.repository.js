import User from "../models/user.model.js";

class UserRepository {
    async getById(user_id) {
        return await User.findById(user_id); 
    }

    async create({ name, email, password }) {
        const user = await User.create({
            name,
            email,
            password
        });
        console.log("User created successfully", { name, email });
        return user;
    }

    async getByEmail(email) {
        const user_found = await User.findOne({ email: email });
        return user_found;
    }

    async updateByid(user_id, updateData) {
        await User.findByIdAndUpdate(user_id, updateData);
    }

    async deleteById(user_id) {
        await User.findByIdAndDelete(user_id);
    }

    async getUserByEmail(email) {
        return await User.findOne({ email });
    }

    async updateUser(id, data) {
        return await User.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );
    }
}

const userRepository = new UserRepository();
export default userRepository;   


