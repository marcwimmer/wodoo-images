var express = require('express');
var net = require('net');
var httpProxy = require('http-proxy');
const path = require('node:path');
var proxy = httpProxy.createProxyServer({ ws: true });
const web_o = Object.values(require('http-proxy/lib/http-proxy/passes/web-outgoing'));
var serveIndex = require('serve-index');


const { createProxyMiddleware } = require('http-proxy-middleware');
var app = express();

const options = {
    odoo_tcp_check: true
};

const server_odoo = {
    protocol: 'http',
    host: process.env.ODOO_HOST,
    port: 8069,
};

function override_favicon(req, res) {
    if (process.env.DEVMODE === "1") {
        if (req.path.indexOf("favicon.ico") > 0 || req.path.indexOf("/favicon/") >= 0) {
            const path_icon = path.join(__dirname, 'favicon_dev.png');
            res.sendFile(path_icon);
            return true;
        }
    }
}


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

proxy.on('proxyRes', (proxyRes, req, res) => {
    //hack: https://github.com/nodejitsu/node-http-proxy/issues/1263
    //ohne dem geht caldav nicht
    for (var i = 0; i < web_o.length; i++) {
        if (web_o[i](req, res, proxyRes, {})) { break; }
    }

    proxyRes.pipe(res);
});

proxy.on('error', function (e) {
    console.debug(e);
});

app.use(
    "/robot-output",
    express.static("/robot_output"),
    serveIndex("/robot_output", { 'icons': true })
);
app.use("/mailer", createProxyMiddleware({
    target: 'http://' + process.env.ROUNDCUBE_HOST + ':80',
}));

app.use("/code", createProxyMiddleware({
    target: 'http://' + process.env.THEIA_HOST + ':80',
    ws: true
}));

app.use(["/vscode", "/websockify"], createProxyMiddleware({
    pathRewrite: {
        '^/vscode/': '/',
    },
    ws: true, // Enable WebSocket proxying
    logLevel: 'debug', // Enable debug logging for troubleshooting
    changeOrigin: true,
    target: 'http://novnc_vscode:6080'
}, (error) => {
    if (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Proxy error');
    }
}));

app.use("/logs", createProxyMiddleware({
    changeOrigin: true,
    pathRewrite: {
        '^/logs': '/'
    },
    target: 'http://' + process.env.LOGS_HOST + ':6688',
    ws: true
}));
app.use("/logs_socket_io", createProxyMiddleware({
    changeOrigin: true,
    pathRewrite: {
        '^/logs_socket_io': '/socket.io'
    },
    target: 'http://' + process.env.LOGS_HOST + ':6688',
    ws: true
}));

app.use(["/longpolling", "/websocket", "/documents/content"], createProxyMiddleware({
    target: 'http://' + process.env.ODOO_HOST + ':8072', ws: true
}));

// TODO if devmode
app.use("/console", createProxyMiddleware({
    target: 'http://' + process.env.WEBSSH_HOST + ':80',
    ws: true,
}));

app.all("/*", async (req, res, next) => {
    if (options.odoo_tcp_check) {
        await _wait_tcp_conn(server_odoo);
    }
    if (override_favicon(req, res)) {
        return;
    }
    proxy.web(req, res, {
        target: server_odoo,
        selfHandleResponse: true,
        ws: true
    }, (e) => {
        console.log(e);
        res.status(500).end();
    });
});


var server = app.listen(80, '0.0.0.0', () => {
    console.log('Proxy server listening on 0.0.0.0:80.');
});
server.setTimeout(3600 * 100000);