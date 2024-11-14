addEventListener('install', () => {
  console.log('install event');
  self.skipWaiting();
});

addEventListener('activate', () => {
  console.log('activate event');
  self.clients.claim().then(() => {
    console.log('clients claimed');
  });
});

console.log('hi from inputServiceWorker.js');
const resolvers = new Map();

addEventListener('message', event => {
  console.log('message event');
  if (event.data.type === 'CDO_PY_INPUT') {
    console.log(`Received input: ${event.data.value} with id ${event.data.id}`);
    const resolverArray = resolvers.get(event.data.id);
    if (!resolverArray || resolverArray.length === 0) {
      console.error('Error handing input: No resolver');
      return;
    }

    const resolver = resolverArray.shift(); // Take the first promise in the array
    resolver(new Response(event.data.value, {status: 200}));
  }
});

addEventListener('fetch', event => {
  console.log('fetch event');
  const url = new URL(event.request.url);

  if (url.pathname === '/cdo-py-get-input/') {
    console.log(`got fetch request for id ${url.searchParams.get('id')}`);
    const id = url.searchParams.get('id');
    const prompt = url.searchParams.get('prompt');

    event.waitUntil(
      (async () => {
        console.log('waiting for clients?');
        // Send CDO_PY_AWAITING_INPUT message to all window clients
        self.clients.matchAll({includeUncontrolled: true}).then(clients => {
          console.log(`clients length: ${clients.length}`);
          clients.forEach(client => {
            //if (client.type === 'window') {
            console.log('posting await message');
            client.postMessage({
              type: 'CDO_PY_AWAITING_INPUT',
              id,
              prompt,
            });
            //}
          });
        });

        // Does not match the window in Safari
        // This is likely due to the request originating from a web worker
        // if (!event.clientId) return
        // const client = await clients.get(event.clientId)
        // if (!client) return
        // client.postMessage({
        //   type: 'CDO_PY_AWAITING_INPUT',
        //   id
        // })
      })()
    );

    const promise = new Promise(r =>
      resolvers.set(id, [...(resolvers.get(id) || []), r])
    );
    event.respondWith(promise);
  }
});
