import Sequelize, { Model } from "sequelize";
import bcrypt from "bcryptjs";

class User extends Model{
    static init(sequelize){
        super.init({
            name: Sequelize.STRING,
            email: Sequelize.STRING,
            password: Sequelize.VIRTUAL,
            password_hash: Sequelize.STRING,
            file_id: Sequelize.STRING
        },{
            name: {
                singular: "user",
                plural: "users"
            },
            sequelize,
        });

        this.addHook("beforeSave", async user => {
            if(user.password){
                user.password_hash = await bcrypt.hash(user.password, 8);
            }
        });
    }

    static associate(models){
        this.belongsTo(models.File, { foreignKey: "file_id" })
    }

    checkPassword(password){
        return bcrypt.compare(password, this.password_hash);
    }

}

export default User;