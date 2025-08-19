# Droplater Starter

Droplater ek Note Scheduling aur Delivery System hai jo Node.js, Express, MongoDB aur Redis par based hai.Iska main kaam hai scheduled notes ko store karna aur unhe defined releaseAt time ke baad webhook par deliver karna.

## 🚀 Features

Notes create karna with title, body, releaseAt, webhookUrl
Status tracking → pending, delivered, failed, dead
REST API endpoints with authentication (Bearer token)
MongoDB for data persistence
Redis for queue management
Worker service for background jobs

### 🛠️ Installation & Run Steps

# 1. Clone Repo
# 2. git clone <your-repo-link>
cd droplater-starter
cd admin-> npm install
cd api->npm install
cd sink->npm install
cd worker->npm install


### 3. Start API Server
# in api -> 
npm run dev

# in admin
 npm run dev

 
 ### on Docker.Desktop 


 
### On Redis 
 Warning: PowerShell detected that you might be using a screen reader and has disabled PSReadLine for compatibility purposes. If you want to re-enable it, run 'Import-Module PSReadLine'.

PS C:\Users\Deepak Kumar Bind\Downloads\Redis-x64-5.0.14.1> .\redis-server.exe
[19224] 19 Aug 11:18:24.305 # oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
[19224] 19 Aug 11:18:24.305 # Redis version=5.0.14.1, bits=64, commit=ec77f72d, modified=0, pid=19224, just started
[19224] 19 Aug 11:18:24.306 # Warning: no config file specified, using the default config. In order to specify a config file use c:\users\deepak kumar bind\downloads\redis-x64-5.0.14.1\redis-server.exe /path/to/redis.conf
                _._
           _.-``__ ''-._
      _.-``    `.  `_.  ''-._           Redis 5.0.14.1 (ec77f72d/0) 64 bit
  .-`` .-```.  ```\/    _.,_ ''-._
 (    '      ,       .-`  | `,    )     Running in standalone mode
 |`-._`-...-` __...-.``-._|'` _.-'|     Port: 6379
 |    `-._   `._    /     _.-'    |     PID: 19224
  `-._    `-._  `-./  _.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |           http://redis.io
  `-._    `-._`-.__.-'_.-'    _.-'
 |`-._`-._    `-.__.-'    _.-'_.-'|
 |    `-._`-._        _.-'_.-'    |
  `-._    `-._`-.__.-'_.-'    _.-'
      `-._    `-.__.-'    _.-'
          `-._        _.-'
              `-.__.-'

[19224] 19 Aug 11:18:24.310 # Server initialized
[19224] 19 Aug 11:18:24.319 * DB loaded from disk: 0.009 seconds
[19224] 19 Aug 11:18:24.319 * Ready to accept connections

 

### # .\redis-cli.exe

 Warning: PowerShell detected that you might be using a screen reader and has disabled PSReadLine for compatibility purposes. If you want to re-enable it, run 'Import-Module PSReadLine'.

PS C:\Users\Deepak Kumar Bind\Downloads\Redis-x64-5.0.14.1> .\redis-cli.exe
127.0.0.1:6379> ping
PONG
127.0.0.1:6379>

 # in sink
  npm run dev

  these output showing
  [nodemon] starting `node src/index.js`
{"level":30,"time":1755582623437,"pid":13516,"hostname":"LAPTOP-VB7E4MKO","port":4000,"msg":"SINK listening"}
{"level":30,"time":1755582623447,"pid":13516,"hostname":"LAPTOP-VB7E4MKO","msg":"Sink Redis connected"}   


### then after

PS C:\Users\Deepak Kumar Bind\OneDrive\Desktop\droplater-starter\sink> node src/webhook.js
🚀 Webhook sink running at http://localhost:4000/sink



  # in worker
  npm run dev
  PS C:\Users\Deepak Kumar Bind\OneDrive\Desktop\droplater-starter\worker> npm run dev

> droplater-worker@1.0.0 dev
> nodemon src/index.js

[nodemon] 3.1.10
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node src/index.js`
It is highly recommended to use a minimum Redis version of 6.2.0
           Current: 5.0.14.1
It is highly recommended to use a minimum Redis version of 6.2.0
           Current: 5.0.14.1
It is highly recommended to use a minimum Redis version of 6.2.0
           Current: 5.0.14.1
[11:22:19] INFO: Starting worker service...
[11:22:19] INFO: Attempting to establish MongoDB connection...
[11:22:19] INFO: MongoDB connection established successfully
[11:22:19] INFO: MongoDB successfully connected        
[11:22:19] INFO: MongoDB connection state: 1


### then after
PS C:\Users\Deepak Kumar Bind\OneDrive\Desktop\droplater-starter\worker> node src/index.js
It is highly recommended to use a minimum Redis version of 6.2.0
           Current: 5.0.14.1
It is highly recommended to use a minimum Redis version of 6.2.0
           Current: 5.0.14.1
It is highly recommended to use a minimum Redis version of 6.2.0
           Current: 5.0.14.1
[11:24:16] INFO: Starting worker service...
[11:24:16] INFO: Attempting to establish MongoDB connection...
[11:24:16] INFO: MongoDB connection established successfully
[11:24:16] INFO: MongoDB successfully connected        
[11:24:16] INFO: MongoDB connection state: 1

  ### Health check:

  bash  ---
  Deepak Kumar Bind@LAPTOP-VB7E4MKO MINGW64 ~/OneDrive/Desktop/droplater-starter (main|REBASE 1/1)
$ curl -H "Authorization: Bearer changeme" "http://localhost:3000/health"
{"ok":true}

## create notes 
By hiting this check Droplater-starter (status)
Deepak Kumar Bind@LAPTOP-VB7E4MKO MINGW64 ~/OneDrive/Desktop/droplater-starter (main|REBASE 1/1)
$ curl -X POST http://localhost:3000/api/notes \
-H "Authorization: Bearer changeme" \
-H "Content-Type: application/json" \
-d '{ "title":"Immediate Test", "body":"Deliver quickly", "releaseAt":"2020-01-01T00:00:00.000Z", "webhookUrl":"http://localhost:4000/sink"}'
{"id":"68a41278036a1c806fc14033"}
Deepak Kumar Bind@LAPTOP-VB7E4MKO MINGW64 ~/OneDrive/Desktop/droplater-starter (main|REBASE 1/1)


## List notes
By hiting this check Droplater-starter (status)
Deepak Kumar Bind@LAPTOP-VB7E4MKO MINGW64 ~/OneDrive/Desktop/droplater-starter (main|REBASE 1/1)
$ curl -X POST http://localhost:3000/api/notes \
-H "Authorization: Bearer changeme" \
-H "Content-Type: application/json" \
-d '{ "title":"Immediate Test", "body":"Deliver quickly", "releaseAt":"2020-01-01T00:00:00.000Z", "webhookUrl":"http://localhost:4000/sink"}'
{"id":"68a41278036a1c806fc14033"}
Deepak Kumar Bind@LAPTOP-VB7E4MKO MINGW64 ~/OneDrive/Desktop/droplater-starter (main|REBASE 1/1)
$ curl -H "Authorization: Bearer changeme" "http://localhost:3000/api/notes?status=pending&page=1"
{"page":1,"total":23,"pageSize":20,"data":[{"id":"68a41278036a1c806fc14033","title":"Immediate Test","status":"pending","lastAttemptCode":null,"releaseAt":"2020-01-01T00:00:00.000Z"},{"id":"68a3ec4c0dbf9ddec99c45fd","title":"Immediate Test","status":"pending","lastAttemptCode":null,"releaseAt":"2020-01-01T00:00:00.000Z"},{"id":"68a3e12b0dbf9ddec99c43fd","title":"Success Note","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-19T06:30:00.000Z"},{"id":"68a3e0b20dbf9ddec99c43f7","title":"Success Note","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-19T06:30:00.000Z"},{"id":"68a3dfc30dbf9ddec99c438f","title":"Test Fail","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-19T05:30:00.000Z"},{"id":"68a3df4f0dbf9ddec99c4389","title":"Test Fail","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-19T05:30:00.000Z"},{"id":"68a3def00dbf9ddec99c4383","title":"Test Fail","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-19T05:30:00.000Z"},{"id":"68a3daba0dbf9ddec99c42d3","title":"Immediate Test","status":"pending","lastAttemptCode":null,"releaseAt":"2020-01-01T00:00:00.000Z"},{"id":"68a2d6c1a94fa894dee32726","title":"hi","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T08:31:00.000Z"},{"id":"68a2d658a94fa894dee326da","title":"Immediate Retry","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T09:30:00.000Z"},{"id":"68a2d53aa94fa894dee32672","title":"mohan","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T09:24:00.000Z"},{"id":"68a2d45ea94fa894dee3261c","title":"ram","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T08:20:00.000Z"},{"id":"68a2d17fa94fa894dee32556","title":"Immediate Test","status":"pending","lastAttemptCode":null,"releaseAt":"2020-01-01T00:00:00.000Z"},{"id":"68a2ce73a94fa894dee324a2","title":"Immediate Test","status":"pending","lastAttemptCode":null,"releaseAt":"2020-01-01T00:00:00.000Z"},{"id":"68a2cd02a94fa894dee3241e","title":"Immediate Test","status":"pending","lastAttemptCode":null,"releaseAt":"2020-01-01T00:00:00.000Z"},{"id":"68a2a0b76b333e4f63157a95","title":"Test Note4","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T04:40:00.000Z"},{"id":"68a299e56b333e4f631579bd","title":"10","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T04:11:00.000Z"},{"id":"68a299316b333e4f63157977","title":"Quick test1","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T05:08:00.000Z"},{"id":"68a298776b333e4f63157923","title":"Quick test","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T04:02:00.000Z"},{"id":"68a296976b333e4f63157855","title":"First test note","status":"pending","lastAttemptCode":null,"releaseAt":"2025-08-18T03:57:00.000Z"}]}
Deepak Kumar Bind@LAPTOP-VB7E4MKO MINGW64 ~/OneDrive/Desktop/droplater-starter (main|REBASE 1/1)

### Mongo shell (check)
# 1. Pending notes dekhne ke liye 
db.notes.find({ status: "pending" }).pretty()


 # 2. Failed notes dekhne ke liye
db.notes.find({ status: "failed" }).pretty()


 # 3. Sabse recent notes dekhne ke liye
 db.notes.find({ status: "dead" }).pretty()


 # Pending notes dekhne ke liye

 db.notes.find().sort({ _id: -1 }).limit(5).pretty()
By this way check all
selft check by entry by title,body,Release At (local) -taking 2 to 3 minet check

