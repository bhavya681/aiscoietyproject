import dns from "node:dns";
import mongoose from "mongoose";

function mongoUri(): string {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is not defined");
    }

    return uri;
}

// This machine's default resolver cannot look up the Atlas SRV records, so
// point Node at public resolvers before the driver resolves the URI.
const dnsServers = process.env.DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

if (dnsServers?.length) {
    dns.setServers(dnsServers);
}

let connection: Promise<typeof mongoose> | undefined;

export async function connectDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    connection ??= mongoose.connect(mongoUri()).catch((error) => {
        connection = undefined;

        throw error;
    });

    return connection;
}
    