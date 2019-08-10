# Django REST + React project

<hr>

### SPA (Single Page Application) example

Non-authorized users are able to view other users posts (words with their definition).

To make posts they must register. Registration window shows user any validation errors occured server side.

After information is checked and user added to table user is automatically logged in.  Now they can post.

Each user can post twice a day. If they'll try to post third time server responds with 429 and appropriate message is shown to user.

After submitting form new post (word) is added to the table server side and shown to user client side.

There is a pagination. Each page contains 5 posts. User can navigate through pagination bar at the bottom.

Each user can view/delete his/her own posts. They can delete only if logged in.


### What is used?

Frontend:

1. [React](https://reactjs.org/)
2. [React Bootstrap](https://react-bootstrap.github.io/)
3. [Axios](https://github.com/axios/axios)

Backend:

1. [Django](https://www.djangoproject.com/) + [REST](https://www.django-rest-framework.org/)
2. [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)

### How to run?

Backend is a standalone API that means Django application is not tied to React application. So you should run both Django and React app

Assuming you have all dependencies installed:

```bash
# clone
git clone https://github.com/VagifMammadaliyev/react-django-rest
cd react-django-rest/backend

# migrate and run django app
./manage.py migrate
./manage.py makemigrations api_v0
./manage.py migrate
./manage.py runserver  # should start on port 8000

# run react app
cd ../frontend
npm install package.json
node script/start.js  # should start on port 3000
```
