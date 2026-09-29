import { readFileSync } from "fs"
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
    const bookRes = await server.inject()
        .post(`/api/books`)
        .body({ name: 'testbook' })
        .headers({authorization: token})
    server.log.info('built test book...')

    const pageRes = await server.inject()
        .post('/api/pages')
        .headers({authorization: token})
        .body({
            bookId: bookRes.body,
            name: 'MyPage'
        })
    server.log.info('built test page...')

    const formData = new FormData()
    const blob = new Blob([readFileSync('../integration/data/2012_SAT_Results.csv')], {type: 'plain/text'})
    formData.append('myFile', blob, 'test-file.txt')
    const sourceRes = await server.inject()
        .post('/api/sources')
        .payload(formData)
        .headers({authorization: token})
    server.log.info('built test source...')

    await server.inject()
        .post('/api/widgets/multiple')
        .headers({authorization: token})
        .body({
            pageId: pageRes.body,
            sourceId: sourceRes.body,
            types: ['scatter', 'histogram', 'histogram']
        })
    server.log.info('built test widgets...')

    server.listen({port: 3333})
})
.catch(err => console.error(err))

