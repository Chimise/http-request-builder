import request from "./request-builder.js";



request().get('http://localhost:3000').set('accept', 'text/plain').invoke().then((res => {
    return res.text();
})).then(body => {
    console.log(body);
}).catch(err => console.log(err));


request().get('http://localhost:3000/posts').invoke().then(res => res.json()).then(message => console.log(message), (err) => console.log(err));