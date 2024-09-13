const Fastify = require('fastify');
const path = require('node:path');
const cookie = require('@fastify/cookie');
const fastify = Fastify({ logger: true });
const fastifyStatic = require('@fastify/static')
const send = require('@fastify/send')
const axios = require("axios");
const net = require("net");


const vncvscode = "http://novnc_vscode:6080";

const server_odoo = {
    protocol: 'http',
    host: process.env.ODOO_HOST,
    port: 8069,
    longpolling_port: 8072,
};

// TODO
const options = {
    odoo_tcp_check: false
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
});
fastify.register(require('@fastify/http-proxy'), {
    upstream: `http://${server_odoo.host}:${server_odoo.longpolling_port}`,
    prefix: '/longpolling',
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
    console.log("Registerung /mailer");
    fastify.register(require('@fastify/http-proxy'), {
        upstream: `http://${process.env.ROUNDCUBE_HOST}:80`,
        prefix: '/mailer',
        rewritePrefix: '/mailer',
    });
}
if (process.env.RUN_WEBSSH === "1") {
    fastify.register(require('@fastify/http-proxy'), {
        upstream: process.env.WEBSSH_HOST,
        prefix: '/console',
        rewritePrefix: '/',
        websocket: false,
        preHandler: (req, res, next) => {
            debugger;
            res.send("HALLO");
            //?hostname=10.0.3.1&fontsize=10&username=cicd_min&password=ZjdmZjVmZjg4ZTMwODRkMTk5MmIzYTdjNGRmM2Q3ZDI=&command=start_tmux%20%27cicd_tmux_session_cicd_cicd_test_odoo_test1_shellshell%27%20%27cicd_cicd-test-odoo_test1%27%20%27/home/cicd/workspace%27%20%27%27
            // TODO
            // if (options.odoo_tcp_check) {
            //     await _wait_tcp_conn(server_odoo);
            // }
            next();
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
fastify.register(require('@fastify/static'), {
    root: '/robot_output',
    prefix: '/robot-output/',
    list: true,
    index: false
})
fastify.register(require('@fastify/http-proxy'), {
    upstream: `${server_odoo.protocol}://${server_odoo.host}:${server_odoo.port}`,
    prefix: '/',
    replyOptions: {
        rewriteRequestHeaders: (originalReq, headers) => {
            headers.host = originalReq.headers.host; // equivalent to sameOrigin
            return headers;
        }
    },
    preHandler: (req, res, next) => {
        debugger;
        // TODO
        // if (options.odoo_tcp_check) {
        //     await _wait_tcp_conn(server_odoo);
        // }
        next();
    },
});

fastify.listen({ port: 80, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Proxy server listening on ${address}`);
});