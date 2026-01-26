import { NextRequest, NextResponse } from 'next/server';

const CAREERS_SERVICE_URL = 'http://localhost:8081/api';

async function handler(req: NextRequest, { params }: { params: { path: string[] } }) {
    const path = params.path.join('/');
    const url = `${CAREERS_SERVICE_URL}/${path}${req.nextUrl.search}`;

    try {
        const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined;

        const headers = new Headers(req.headers);
        headers.delete('host');
        // headers.set('host', 'localhost:8081'); // Optional, sometimes needed

        const response = await fetch(url, {
            method: req.method,
            headers: headers,
            body: body,
            // @ts-ignore
            duplex: 'half' // Required for streaming bodies in some node fetch implementations
        });

        const data = await response.blob();

        return new NextResponse(data, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    } catch (error: any) {
        console.error(`Proxy Error to ${url}:`, error);
        return NextResponse.json({ message: 'Error connecting to Careers Service', error: error.message }, { status: 502 });
    }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as HEAD };
