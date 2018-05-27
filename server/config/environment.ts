export default {
    db: {
        mongoose: {
            app: {
                host: "localhost",
                dbname: "merntest",
                port: 27017
            },
            data: {
                host: "localhost",
                dbname: "mern-data",
                port: 27017
            }
        }
    },
    server: {
        port: 3333,
        protocol: "http",
        location: "localhost"
    },
    shared: {
        secret: "dantheman"
    }
};