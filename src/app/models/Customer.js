import Sequelize, { Model } from "sequelize";
import { Op }  from "sequelize";

class Customer extends Model{
    static init(sequelize){
        super.init({
            name: Sequelize.STRING,
            email: Sequelize.STRING,
            status: Sequelize.ENUM("ACTIVE", "AHCHIVED"),
        },{
            scopes: {
                active: {
                    where: {
                        status: "ACTIVE"
                    }
                },
                created(date) {
                    return {
                         where: {
                            createdAt: {
                                [Op.gte] : date
                            }
                    }
                }
                }
            },
            //hooks: {
            //    beforeValidate: (customer, options) => {
            //        customer.status = "ARCHIVED";
            //    },
            //},
            name: {
                singular: "customer",
                plural: "customers"
            },
            sequelize,
        });
    }

    static associate(models){
        this.hasMany(models.Contact)
    }
}

export default Customer;