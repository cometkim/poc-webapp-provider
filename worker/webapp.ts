export async function handleWebapp(event: FetchEvent): Promise<Response> {
  const url = new URL(event.request.url);
  const match = url.host.match(/(?<appname>[\w\-]+)\.(?<username>[\w\-]+)\.webapp\.hyeseong\.kim/);

  if (match.groups) {
    const { username, appname } = match.groups;
    return new Response(JSON.stringify({ appname, username }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } else {
    return new Response('Not found', { status: 404 });
  }
}
