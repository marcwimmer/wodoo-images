const Fastify = require('fastify');
const path = require('node:path');
const cookie = require('@fastify/cookie');
const fastify = Fastify({trustProxy: true, logger: process.env.FASTIFY_DEBUG === "1" });
const fastifyStatic = require('@fastify/static')
const send = require('@fastify/send')
const serveIndex = require('serve-index');
const net = require("net");
const fastifyExpress = require('@fastify/express');



const vncvscode = "http://novnc_vscode:6080";

const server_odoo = {
    protocol: 'http',
    host: process.env.ODOO_HOST,
    port: 8069,
    longpolling_port: 8072,
};

const options = {
    odoo_tcp_check: true
};

const path_icon = path.join(__dirname, 'favicon.ico');

const PORT = process.env.PORT || 3000;

fastify.register(cookie);

function _wait_tcp_conn(target) {
    return new Promise((resolve, reject) => {
        let do_connect = () => {
            var client = net.connect({ host: target.host, port: target.port }, () => {
                resolve();
                client.end()
            });
            client.on('error', function (e) {
                console.log("Error connecting to " + target + ": " + (new Date()));
                client.end();
                setTimeout(() => {
                    do_connect();
                }, 100);
            });
        };
        do_connect();
    });
}

function override_favicon(req, res) {
    if (process.env.DEVMODE === "1") {
        if (req.path.indexOf("favicon.ico") > 0 || req.path.indexOf("/favicon/") >= 0) {
            const path_icon = path.join(__dirname, 'favicon_dev.png');
            res.sendFile(path_icon);
            return true;
        }
    }
}

fastify.register(require('@fastify/http-proxy'), {
    upstream: `http://${server_odoo.host}:${server_odoo.longpolling_port}`,
    ws: true,
    prefix: '/websocket',
    rewritePrefix: '/websocket',
});
fastify.register(require('@fastify/http-proxy'), {
    upstream: `http://${server_odoo.host}:${server_odoo.longpolling_port}`,
    prefix: '/longpolling',
    rewritePrefix: '/longpolling',
});
if (process.env.DEVMODE === "1") {
    fastify.register(require('@fastify/http-proxy'), {
        upstream: vncvscode,
        prefix: '/code',
        preHandler: (req, reply, next) => {
            reply.redirect("/vscode/vnc.html?autoconnect=true&path=vscode?token=vscode");
            next();
        },
    });
    fastify.register(require('@fastify/http-proxy'), {
        upstream: vncvscode,
        prefix: '/vscode',
        rewritePrefix: '/',
        websocket: true,
    });
    fastify.register(require('@fastify/http-proxy'), {
        upstream: `http://${process.env.LOGS_HOST}:6688`,
        prefix: '/logs',
        rewritePrefix: '/',
        websocket: true,
    });
    fastify.register(require('@fastify/http-proxy'), {
        upstream: `http://${process.env.LOGS_HOST}:6688`,
        prefix: '/logs_socket_io',
        rewritePrefix: '/socket.io',
        websocket: true,
    });
}
if (process.env.RUN_MAIL === "1") {
    fastify.register(require('@fastify/http-proxy'), {
        upstream: `http://${process.env.ROUNDCUBE_HOST}:80`,
        prefix: '/mailer',
        rewritePrefix: '/mailer',
        replyOptions: {
            rewriteRequestHeaders: (originalReq, headers) => {
                console.log(originalReq.headers.host);
                headers.host = originalReq.headers.host; // equivalent to sameOrigin
                return headers;
            }
        }
    })
}
if (process.env.RUN_WEBSSH === "1") {
    fastify.register(require('@fastify/http-proxy'), {
        upstream: process.env.WEBSSH_HOST,
        prefix: '/console',
        rewritePrefix: '/',
        websocket: true,
        preHandler: (req, res, next) => {

            const host = 'console';
            const username = 'odoo';
            const password = Buffer.from("odoo").toString('base64');
            if (req.url.indexOf("?") == -1) {
                const url = req.url + `?hostname=${host}&fontsize=10&username=${username}&password=${password}&command=`
                res.redirect(url, 301)
            }
            else {
                next()
            }
        },
    });
    fastify.register(require('@fastify/http-proxy'), {
        upstream: process.env.WEBSSH_HOST,
        prefix: '/consolestream',
        rewritePrefix: '/',
        websocket: false,
    });
}
fastify.register(require('@fastify/http-proxy'), {
    upstream: 'http://cicdlogs:6688',
    prefix: '/cicdlogs_socket_io',
    rewritePrefix: "/socket.io",
    websocket: true,
});
fastify.register(require('@fastify/http-proxy'), {
    upstream: 'http://cicdlogs:6688',
    prefix: '/cicdlogs',
    rewritePrefix: '/',
    websocket: true,
});
fastify.register(require('@fastify/http-proxy'), {
    upstream: "http://robot_file_browser:80",
    prefix: '/robot-output',
    rewritePrefix: '/robot-output',
})

fastify.register(require('@fastify/http-proxy'), {
    upstream: `${server_odoo.protocol}://${server_odoo.host}:${server_odoo.port}`,
    prefix: '/',
    replyOptions: {
        undici: {
            timeout: 3600 * 1000,
        },
        rewriteRequestHeaders: (originalReq, headers) => {
            headers.host = originalReq.headers.host; // equivalent to sameOrigin
            return headers;
        }
    },
    preHandler: (req, res, next) => {
        if (options.odoo_tcp_check) {
            _wait_tcp_conn(server_odoo);
        }
        next();
    },
});

fastify.setErrorHandler((error, request, reply) => {
    // Log the error if needed
    fastify.log.error(error);

    // Set response type to HTML
    reply.type('text/html');

    // Send a custom HTML error page
    reply.status(500).send(`
        <html>
            <head><title>Server Error</title></head>
            <body>
            <h1>500 - Internal Server Error</h1>
            <p>Oops! Something went wrong on our end.</p>
            <p>Click here to return back to the cicd application.</p>
            <p>Error Details: ${error.message}</p>
            </body>
        </html>
    `);
});

fastify.listen({ port: 80, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Proxy server listening on ${address}`);
});