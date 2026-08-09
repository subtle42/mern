import { FastifyInstance } from "fastify";
import { getWidgetSocket } from "../api/widget/socket";
import { getBookSocket } from "../api/book/socket";
import { getSourceSocket } from "../api/source/socket";
import { getPageSocket } from "../api/page/socket";
import { isAuthenticated } from "../auth/auth.service";


export const buildSocketServer = (app: FastifyInstance) => {

    app.get('/ws', {
        websocket: true,
        preValidation: [isAuthenticated]
    }, async(connection, req) => {
        app.log.warn(`user: ${req.user}`)
        const { user } = req; // Populated by jwtVerify
  
        app.log.info(`User ${user._id} connected via WebSocket`);

        wsFactory.sources.join(connection, user._id)
        connection.send(JSON.stringify({
            namespace: 'sources',
            channel: 'addedOrChanged',
            data: await wsFactory.sources.getInitialState(user._id)
        }))
        
        wsFactory.books.join(connection, user._id)
        connection.send(JSON.stringify({
            namespace: 'books',
            channel: 'addedOrChanged',
            data: await wsFactory.books.getInitialState(user._id)
        }))

        connection.on('message', async(message) => {
            try {
                const {namespace, room, channel} = JSON.parse(message.toString())
    
                if (!namespace) return connection.send(JSON.stringify({
                    error: 'No namespace'
                }))
                if (!room) return connection.send(JSON.stringify({
                    error: 'No room'
                }))
                switch(namespace) {
                    case 'pages':
                        await wsFactory.pages.join(room, user._id, connection)
                        break;
                    case 'widgets':
                        await wsFactory.widgets.join(room, user._id, connection)
                        break;
                    default:
                        connection.send(JSON.stringify({
                            error: `The namespace: ${namespace}, does not exist`
                        }))
                }
            }
            catch (err) {
                console.log('in my error')
                connection.send(JSON.stringify({error: err.toString()}))
            }
        });
    })

    const wsFactory = {
        sources: getSourceSocket(),
        books: getBookSocket(),
        pages: getPageSocket(),
        widgets: getWidgetSocket(),
    }
    const namespaceList = Object.keys(wsFactory)
}
