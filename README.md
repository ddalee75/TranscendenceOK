# Transcendence

<b>Creation of a website for an online game “PONG”, with private and public chat and user interface</b>

Project Ecole 42 <br>
Team project of 5 (in progress)<br>

Technology :<br>
Angular • Node JS - Nest JS • Prisma • PostgreSQL • HTML • CSS • Docker<br><br>


Overview<br>
• library / framework with last stable version.<br>
• Compatible with the latest up to date version of Chrome, FireFox.<br>
• Single-page application.<br><br>

Build dev<br>
docker-compose up --build<br>
• Use Docker in rootless mode<br>
• Runtimes files must be located in /goinfre or /sgoinfre<br>
• Can’t use so called “bind-mount volumes” between the host and the container if non-root UIDs are used in the container.<br>
• Several fallbacks exist: Docker in a VM, rebuild container after changes, craft own docker image with root as unique UID<br><br>

Security<br>
• Any password stored must be hashed<br>
• Use a strong password hashing algorithm<br>
• The website must be protected against SQL injection<br>
• Implement some kind of server-side validation for forms and any user input<br>
• Any credentials, API keys, env variables etc... must be saved locally in a .env file and ignored by git<br><br>

User Account<br>
• Using the OAuth system of 42 intranet<br>
• User should be able to upload an avatar<br>
• User should be able to enable two-factor authentication (Google Authenticator or sending a text message to their phone)<br>
• User should be able to add other users as friends and see their current status online, offline, in a game, and so forth<br>
• Stats have to be displayed on the user profile. Such as: wins and losses, ladder level, achievements, and so forth<br>
• User should have a Match History including 1v1 games, ladder, and anything else useful<br>
• Anyone who is logged in should be able to consult it.<br><br>

Chat<br>
• create channels (chat rooms) : public, or private, or protected by a password<br>
• Channel owner<br>
 - User who has created a new channel is automatically set as the channel owner<br>
 - can set a password required to access the channel, change it, and also remove it<br>
 - Is a channel administrator. They can set other users as administrators<br>
 - Administrators of a channel can ban or mute users for a limited time<br>
• Send direct messages to other users<br>
• Block other users<br>
• See no more messages from the account they blocked<br>
• Invite other users to play a Pong game through the chat interface<br>
• Should be able to access other players profiles through the chat interface<br><br>

Game<br>
• Play a live Pong game versus another player directly on the website<br>
• Matchmaking system<br>
- User can join a queue until they get automatically matched with someone else<br>
• Canvas game or game rendered in 3D<br>
- It must be faithful to the original Pong (1972)<br>
• Customization options<br>
- For example, power-ups or different maps<br>
• Select a default version of the game without any extra features if they want to<br>
• The game must be responsive<br>
• watch a live play between other users without interfering with it<br><br>

↓ Transcendence In Screenshot ↓<br><br>



![Transcendence01](https://user-images.githubusercontent.com/92326016/203372148-0041e189-7ac9-4753-a62a-37bdd574563f.jpg)

![Transcendence02](https://user-images.githubusercontent.com/92326016/203372475-3b3026a1-e6cb-451f-99d4-c3d2f5a25de9.jpg)

![Screenshot from 2022-12-12 16-21-58](https://user-images.githubusercontent.com/92326016/207093483-8ddf867b-e133-42ee-a0d9-2ff0f0d06aba.png)


![Transcendence06](https://user-images.githubusercontent.com/92326016/203372674-5651f41b-4dee-455c-815e-42f60bcaa6c0.jpg)
![Screenshot from 2022-12-12 16-23-11](https://user-images.githubusercontent.com/92326016/207093531-e7666e38-594a-4c4d-ac25-f0ee1269803b.png)
![Screenshot from 2022-12-12 17-03-46](https://user-images.githubusercontent.com/92326016/207093995-f3d879b5-ec1a-44cf-a741-d8c9cc0ce109.png)

![Screenshot from 2022-12-12 16-22-34](https://user-images.githubusercontent.com/92326016/207093542-4648c8e3-46c3-4166-a3d5-e43cf2962546.png)
![Screenshot from 2022-12-12 16-21-47](https://user-images.githubusercontent.com/92326016/207093558-3486af32-baa1-4eab-b24e-43e9f22d3a38.png)
![Screenshot from 2022-12-12 16-21-36](https://user-images.githubusercontent.com/92326016/207093566-455dac8a-a364-4353-bbb6-c2678c1babca.png)

![Transcendence07](https://user-images.githubusercontent.com/92326016/203372693-45d20457-fcac-4309-9781-d4110379537d.jpg)


![Transcendence08](https://user-images.githubusercontent.com/92326016/203372725-ed45cb75-6878-4956-acfc-2646535a53ab.jpg)

![Transcendence09](https://user-images.githubusercontent.com/92326016/203372747-c97fc65c-f6f7-4c0a-9be7-14785c3f57a8.jpg)
![Transcendence10](https://user-images.githubusercontent.com/92326016/203372805-f68798b4-5651-4a89-820f-f47387ba403d.jpg)

![Transcendence11](https://user-images.githubusercontent.com/92326016/203372848-dd9bb5ea-8820-43a7-a498-30aeb99d7015.jpg)

