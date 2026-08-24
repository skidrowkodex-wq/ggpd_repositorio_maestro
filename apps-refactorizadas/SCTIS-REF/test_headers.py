from werkzeug.datastructures import Headers
h = Headers([('Set-Cookie', 'foo=bar'), ('Set-Cookie', 'baz=qux')])
new_headers = Headers()
for k, v in h.items():
    if k.lower() == 'set-cookie':
        new_headers.add(k, v + '; Partitioned')
    else:
        new_headers.add(k, v)
print(new_headers)
