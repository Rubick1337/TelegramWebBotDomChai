## Как запустить сервер
1. перед началом запуска выполните команду npm install
2. поставьте свой порт в файле .env
- PORT=8000
3. введите данные для подключения postgre и redis в файле .env
- PostgreSQL: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- Redis: REDIS_HOST, REDIS_PORT
4. запустите redis если это windows разверните redis в docker командами
-  docker run --name redis -p 6379:6379 -d redis - запускает redis-сервер в контейнере, доступный на localhost:6379)
- затем откройте два терминала в одном пропишите docker start redis , а во втором docker exec -it redis redis-cli
5. выполните команду в терминале ide cd tg-web-app-bot-server
6. выполните в этом же терминале команду npm start