local resolver = require "resty.dns.resolver"
local hostname = "odoo"
local backup = "http://127.0.0.1:8080"
local varname = "target_odoo"
local port1 = "8069"
local port2 = "8069"
ngx.var[varname] = backup
ngx.var[varname .. "chat"] = backup

-- Resolve the hostname dynamically
local r, err = resolver:new({
    nameservers = {"127.0.0.11"}, -- Docker's DNS resolver
    retrans = 5,
    timeout = 2000, -- 2 seconds timeout
})

if not r then
    ngx.log(ngx.ERR, "Failed to instantiate the resolver: ", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

local answers, err = r:query(hostname) -- Replace "odoo" with your service hostname

if not answers then
    ngx.log(ngx.ERR, "Failed to query the DNS server: ", err)
    ngx.exit(ngx.HTTP_SERVICE_UNAVAILABLE)
end

if answers.errcode then
    ngx.log(ngx.ERR, "DNS server returned error code: ", answers.errcode, ": ", answers.errstr)
    ngx.exit(ngx.HTTP_SERVICE_UNAVAILABLE)
end

local ip
for _, ans in ipairs(answers) do
    if ans.address then
        ip = ans.address
        break
    end
end

if not ip then
    ngx.log(ngx.WARN, "No valid IP address found for " .. hostname .. "; using backup")
    return
end

local backend = "http://" .. ip .. ":" .. port1
local backend_chat = "http://" .. ip .. ":" .. port2

ngx.var[varname] = backend
ngx.var[varname .. "chat"] = backend_chat