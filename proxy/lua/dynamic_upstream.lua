local resolver = require "resty.dns.resolver"
local backup = "http://127.0.0.1:8080"

-- Resolve the hostname dynamically
local r, err = resolver:new({
    nameservers = {"127.0.0.11"}, -- Docker's DNS resolver
    retrans = 5,
    timeout = 2000, -- 2 seconds timeout
})

if not r then
    ngx.log(ngx.ERR, "Failed to instantiate the resolver: ", err)
    ngx.var.target_odoo = backup
    ngx.var.target_odoochat = backup
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

local answers, err = r:query("odoo") -- Replace "odoo" with your service hostname

if not answers then
    ngx.log(ngx.ERR, "Failed to query the DNS server: ", err)
    ngx.var.target_odoo = backup
    ngx.var.target_odoochat = backup
    ngx.exit(ngx.HTTP_SERVICE_UNAVAILABLE)
end

if answers.errcode then
    ngx.log(ngx.ERR, "DNS server returned error code: ", answers.errcode, ": ", answers.errstr)
    ngx.var.target_odoo = backup
    ngx.var.target_odoochat = backup
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
    ngx.var.target_odoo = backup
    ngx.var.target_odoochat = backup
    ngx.log(ngx.WARN, "No valid IP address found for 'odoo'; using backup")
    return
end

local backend = "http://" .. ip .. ":8069"
local backend_chat = "http://" .. ip .. ":8072"

ngx.var.target_odoo = backend
ngx.var.target_odoochat = backend_chat

ngx.log(ngx.INFO, "Target Odoo set to: ", ngx.var.target_odoo)
ngx.log(ngx.INFO, "Target Odoo Chat set to: ", ngx.var.target_odoochat)