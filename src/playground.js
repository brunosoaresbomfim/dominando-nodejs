import "./database";

import Customer from "./app/models/Customer";

class Playground {
    static async play() {
        //const customers = await Customers.scope("active").findAll();
        //const customers = await Customers.scope({method : [ "created", new Date(2020,2,1)]}).findAll();
        
        const customerNew = await Customer.create({
            name: "Escola Sonia Burgos2",
            email: "faq@escolasoniaburgos.com.br",
        })

        //const customer = await Customer.findByPk(2);

        //const customerUpdate = await customer.update({
        //    status: "ARCHIVED"
        //})

        //const customer = await Customer.findByPk(3);

        //const customerDestroy = await customer.destroy();

        console.log(JSON.stringify(customerNew, null, 2));
    }
}

Playground.play();