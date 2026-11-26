import { buildServer } from "./app";


const runBuild = async() => {
    await buildServer({
        noDb: true,
        serveSwagger: false
    })
}

runBuild()
.then(() => 'built swagger')
.catch(err => console.error(err))