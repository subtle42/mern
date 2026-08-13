import { buildMongoDb, buildServer } from "./app"
import { createUserAndLogin } from "./testUtils"



// buildMongoDb()
// .then(() => buildServer())
buildServer()
.then(async({server, db}) => {
    const token = await createUserAndLogin(server, {
        email: 'test@test.com',
        name: 'test',
        password: 'test'
    })
    await server.inject()
        .post(`/api/books`)
        .body({ name: 'testbook' })
        .headers({authorization: token})
    server.listen({port: 3333})
})
.catch(err => console.error(err))

