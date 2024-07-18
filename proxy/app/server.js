var express = require('express');
var net = require('net');
var httpProxy = require('http-proxy');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('node:path');
var serveIndex = require('serve-index');
var app = express();

const vncvscode = "http://novnc_vscode:6080";

const server_odoo = {
    protocol: 'http',
    host: process.env.ODOO_HOST,
    port: 8069,
};

const options = {
    odoo_tcp_check: true
};

const proxyOdoo = createProxyMiddleware({
    target: '',
    router: function (req) {
        let target = {};
        Object.assign(target, server_odoo);
        if (req.url.indexOf("/longpolling") === 0) {
            target.port = 8072;
        }
        else if (req.url.indexOf("/websocket") === 0) {
            target.port = 8072;
        }
        else if (req.url.indexOf("/documents/content") === 0) {
            target.port = 8072;
        }
        else if (req.url.indexOf("/mailer") === 0) {
            target = 'http://' + process.env.ROUNDCUBE_HOST + ':80';
        }
        else if (req.url.indexOf("/vscode") === 0) {
            // http://server:port/vscode/vnc.html?path=vscode?token=vscode
            target = vncvscode;
        }
        // app.use("/logs", createProxyMiddleware({
        //     changeOrigin: true,
        //     pathRewrite: {
        //         '^/logs': '/'
        //     },
        //     target: 'http://' + process.env.LOGS_HOST + ':6688',
        //     ws: false
        // }));
        // app.use("/logs_socket_io", createProxyMiddleware({
        //     changeOrigin: true,
        //     pathRewrite: {
        //         '^/logs_socket_io': '/socket.io'
        //     },
        //     target: 'http://' + process.env.LOGS_HOST + ':6688',
        //     ws: false
        // }));

        // // TODO if devmode
        // app.use("/console", createProxyMiddleware({
        //     target: 'http://' + process.env.WEBSSH_HOST + ':80',
        //     ws: false,
        // }));

        return target;
    },
    ws: true,
    logLevel: 'debug',
    pathRewrite: {}
}
);


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


app.use(
    "/robot-output",
    express.static("/robot_output"),
    serveIndex("/robot_output", { 'icons': true })
);
app.all("*", async (req, res, next) => {
    if (options.odoo_tcp_check) {
        await _wait_tcp_conn(server_odoo);
    }
    if (override_favicon(req, res)) {
        console.log("Delivering favicon");
        return;
    }
    //console.log("proxying " + req.path + " to: " + target);
    proxyOdoo(req, res, next);
});

var server = app.listen(80, '0.0.0.0', () => {
    console.log('Proxy server listening on 0.0.0.0:80.');
});
server.setTimeout(3600 * 100000);
server.on('upgrade', proxyOdoo);