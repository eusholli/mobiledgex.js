module.exports = function (io) {

    // io stuff here... io.on('conection..... 

    let sessionData = [];
    let sessions = 0;

    io.on("connection", function (socket) {
        sessionData[socket.id] = {
            appName: undefined,
            latency: undefined,
            previousLatency: undefined,
            totalJitter: undefined,
            jitter: undefined,
            pingSampleSize: undefined,
            totalLatency: undefined,
            averageLatency: undefined
        };

        console.log("a user connected, #sessions: " + ++sessions);
        socket.on("disconnect", function () {
            console.log("user disconnected, #sessions: " + --sessions);
            delete sessionData[socket.id];
        });

        socket.on("latencyTest", function () {
            socket.emit("latencyResp");
        });

        socket.on("push latency", function (appName, latest) {

            console.log("latest latency: " + latest);

            let session = sessionData[socket.id];
            session.latency = latest;

            if (session.appName === undefined) {
                session.appName = appName;
                session.pingSampleSize = 1;
                session.totalJitter = 0;
                session.averageLatency = latest;
                session.totalLatency = latest;

            } else {
                session.totalJitter = session.totalJitter + Math.abs(latest - session.previousLatency);
                session.jitter = (session.totalJitter / session.pingSampleSize).toFixed(2);
                session.pingSampleSize++;
                session.totalLatency += latest;
                session.averageLatency = (session.totalLatency / session.pingSampleSize).toFixed(2);
            }

            session.previousLatency = latest;

            socket.emit("push latency", {
                'latency': session.latency,
                'jitter': session.jitter,
                'pings': session.pingSampleSize,
                'averageLatency': session.averageLatency
            });
        });

        socket.on("get latency", function (appName) {

            let session = sessionData[socket.id];

            console.log("get latency: " + session.latency);
            socket.emit("get latency", {
                'latency': session.latency,
                'jitter': session.jitter,
                'pings': session.pingSampleSize,
                'averageLatency': session.averageLatency
            });
        });
    });
}
